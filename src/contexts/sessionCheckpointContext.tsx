"use client";

import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import type { MultiPolygon, Polygon } from "ol/geom";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AREA_SCOPING_TYPE } from "@/constants";
import { AuthContext } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import { MapContext } from "@/contexts/mapContext";
import {
  type DataTrainingActiveTab,
  type LucCustomTab,
  type LucQuickPhase,
  type LucView,
  MapGenerationContext,
} from "@/contexts/mapGenerationContext";
import { type ActiveProject, activeProjectStore } from "@/lib/activeProjectStore";
import { createDebounced } from "@/lib/debounce";
import { createProject, getProject, updateProjectCheckpoint } from "@/lib/projectsApi";
import {
  buildCheckpoint,
  buildDrafts,
  type CheckpointInputs,
  type CheckpointOwner,
  isStep1Recorded,
  panelToWizardStep,
  type SessionCheckpoint,
  shouldOfferResume,
} from "@/lib/sessionCheckpoint";
import { isValidCheckpoint, sessionStore } from "@/lib/sessionStore";
import {
  getTemporalRangeDateEnd,
  getTemporalRangeDateStart,
} from "@/lib/utils";
import { Marker } from "@/types/marker";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
// "nothing": no named project is active or there is no recorded work yet.
export type ManualSaveResult = "saved" | "failed" | "nothing";

interface SessionCheckpointContextType {
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  recordedSteps: boolean[];
  pendingResume: SessionCheckpoint | null;
  isRestoring: boolean;
  canSaveProgress: boolean;
  hasUnclaimedCheckpoint: boolean;
  activeProject: ActiveProject | null;
  canNameProject: boolean;
  shouldOfferNaming: boolean;
  saveProgress: () => boolean;
  resumePendingSession: () => void;
  discardPendingSession: () => void;
  clearCheckpoint: () => void;
  createNamedProject: (name: string) => Promise<boolean>;
  openProject: (id: string) => Promise<boolean>;
  dismissNamingOffer: () => void;
  saveProjectNow: () => Promise<ManualSaveResult>;
}

const DEFAULT_VALUE: SessionCheckpointContextType = {
  saveStatus: "idle",
  lastSavedAt: null,
  recordedSteps: [false, false, false, false, false],
  pendingResume: null,
  isRestoring: false,
  canSaveProgress: false,
  hasUnclaimedCheckpoint: false,
  activeProject: null,
  canNameProject: false,
  shouldOfferNaming: false,
  saveProgress: () => false,
  resumePendingSession: () => {},
  discardPendingSession: () => {},
  clearCheckpoint: () => {},
  createNamedProject: async () => false,
  openProject: async () => false,
  dismissNamingOffer: () => {},
  saveProjectNow: async () => "nothing",
};

const SessionCheckpointContext =
  createContext<SessionCheckpointContextType>(DEFAULT_VALUE);

const DRAFT_SAVE_DELAY_MS = 1500;

const SessionCheckpointContainer = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isHydrated, user } = useContext(AuthContext);
  const { sessionId, setSessionId } = useContext(GlobalContext);
  const mapContext = useContext(MapContext);
  const mg = useContext(MapGenerationContext);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedCheckpoint, setLastSavedCheckpoint] =
    useState<SessionCheckpoint | null>(null);
  const [pendingResume, setPendingResume] = useState<SessionCheckpoint | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreMosaicStartedRef = useRef(false);
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null);
  const activeProjectRef = useRef<ActiveProject | null>(null);
  activeProjectRef.current = activeProject;
  const [shouldOfferNaming, setShouldOfferNaming] = useState(false);

  const polygonGeoJSON = useMemo(() => {
    if (!mapContext.polygon) return null;
    try {
      return new GeoJSON().writeGeometry(mapContext.polygon);
    } catch {
      return null;
    }
  }, [mapContext.polygon]);

  const baseInputs: Omit<CheckpointInputs, "owner"> = {
    sessionId,
    stepKey: mg.stepKey,
    progressPanelIndex: mg.progressPanelIndex,
    areaScopingType: mg.areaScopingType,
    polygonGeoJSON,
    areaScopingPolygonArea: mg.areaScopingPolygonArea,
    areaScopingPolygonFileName: mg.areaScopingPolygonFileName,
    areaScopingPolygonFileSize: mg.areaScopingPolygonFileSize,
    polygonData: mg.polygonData,
    areaScopingRegency: mg.areaScopingRegency,
    spatialResolution: mg.spatialResolution,
    temporalCoverage: mg.temporalCoverage,
    temporalCoverageUnit: mg.temporalCoverageUnit,
    satelliteSource: mg.satelliteSource,
    maximumCloudCover: mg.maximumCloudCover,
    lucSource: mg.lucSource,
    lucView: mg.lucView,
    lucCustomTab: mg.lucCustomTab,
    lucQuickPhase: mg.lucQuickPhase,
    lucExcelConfirmed: mg.lucExcelConfirmed,
    lucDefaultConfirmed: mg.lucDefaultConfirmed,
    lucQuickRows: mg.lucQuickRows,
    defaultArray: mg.defaultArray,
    classArray: mg.classArray,
    LUCfilename: mg.LUCfilename,
    LUCfilesize: mg.LUCfilesize,
    dataTrainingActiveTab: mg.dataTrainingActiveTab,
    markerArray: mapContext.markerArray.map(
      ({ coordinates, id, name, class_id, class_color }) => ({
        coordinates,
        id,
        name,
        class_id,
        class_color,
      }),
    ),
    uploadedFiles: mg.uploadedFilesArray.map((f) => ({
      name: f.filename || f.file.name,
      size: f.filesize || f.file.size,
    })),
    isTrainingDataChanged: mg.isTrainingDataChanged,
    sampleQualityConfirmed: mg.sampleQualityConfirmed,
    selectedPredictors: mg.selectedPredictors,
    numberOfTrees: mg.numberOfTrees,
    minLeafPopulation: mg.minLeafPopulation,
    splitRatio: mg.splitRatio,
    mapGenerated: Boolean(mg.generateMapDownloadURL),
  };

  const ownerFromUser = (u: { email: string; id?: string | number }): CheckpointOwner =>
    u.id !== undefined ? { email: u.email, id: u.id } : { email: u.email };

  // Autosave stays login-gated: inputs is null while anonymous, so the
  // confirmation/draft effects below never fire for logged-out users.
  const inputs: CheckpointInputs | null =
    isAuthenticated && user ? { owner: ownerFromUser(user), ...baseInputs } : null;

  const candidate = inputs
    ? buildCheckpoint(inputs, buildDrafts(inputs))
    : null;
  const confirmationSig = candidate
    ? JSON.stringify({ ...candidate, savedAt: "", drafts: null })
    : "";
  const draftSig = candidate?.drafts ? JSON.stringify(candidate.drafts) : "";
  
  const candidateRef = useRef<SessionCheckpoint | null>(null);
  candidateRef.current = candidate;

  // Resolves true once the checkpoint is stored everywhere it should be
  // (false = local copy written, server sync of the named project failed).
  // Auto-save callers ignore the result; the manual save reports it.
  const writeCheckpoint = useCallback((cp: SessionCheckpoint): Promise<boolean> => {
    const stamped: SessionCheckpoint = {
      ...cp,
      savedAt: new Date().toISOString(),
    };

    const project = activeProjectRef.current;
    const syncTarget = project && project.sessionId === stamped.sessionId ? project : null;
    setSaveStatus("saving");

    return sessionStore.save(stamped).then(() => {
      if (!syncTarget) {
        setLastSavedCheckpoint(stamped);
        setSaveStatus("saved");
        return true;
      }
      return updateProjectCheckpoint(syncTarget.id, stamped)
        .then(() => {
          setLastSavedCheckpoint(stamped);
          setSaveStatus("saved");
          return true;
        })
        .catch(() => {
          setLastSavedCheckpoint(stamped);
          setSaveStatus("error");
          return false;
        });
    })
  }, []);

  const debouncedDraftSave = useMemo(
    () =>
      createDebounced(
        (cp: SessionCheckpoint) => void writeCheckpoint(cp),
        DRAFT_SAVE_DELAY_MS,
      ),
    [writeCheckpoint],
  );

  const [hasUnclaimedCheckpoint, setHasUnclaimedCheckpoint] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated) {
      setHasUnclaimedCheckpoint(false);
      return;
    }
    void sessionStore.load().then((cp) => {
      setHasUnclaimedCheckpoint(cp !== null && cp.owner === null);
    });
  }, [isAuthenticated, isHydrated]);

  const canSaveProgress = !isAuthenticated && isStep1Recorded({ owner: null, ...baseInputs})
  const anonInputsRef = useRef<CheckpointInputs>({owner: null, ...baseInputs})
  anonInputsRef.current = {owner: null, ...baseInputs}

  const saveProgress = useCallback((): boolean => {
    const i = anonInputsRef.current
    const cp = buildCheckpoint(i, buildDrafts(i))
    if (!cp) return false
    void writeCheckpoint(cp)
    setHasUnclaimedCheckpoint(true)
    return true
  }, [writeCheckpoint])

  const lastConfirmationSigRef = useRef("");
  useEffect(() => {
    if (!candidate || pendingResume !== null) return;
    if (confirmationSig === lastConfirmationSigRef.current) return;
    lastConfirmationSigRef.current = confirmationSig;
    debouncedDraftSave.cancel();
    void writeCheckpoint(candidate);
  }, [
    confirmationSig,
    candidate,
    pendingResume,
    writeCheckpoint,
    debouncedDraftSave,
  ]);

  const lastDraftSigRef = useRef("");
  useEffect(() => {
    if (!candidate || pendingResume !== null || draftSig === "") return;
    if (draftSig === lastDraftSigRef.current) return;
    lastDraftSigRef.current = draftSig;
    setSaveStatus("saving");
    debouncedDraftSave(candidate);
  }, [draftSig, candidate, pendingResume, debouncedDraftSave]);

  const offeredEmailsRef = useRef<Set<string>>(new Set());

  const wasAuthenticatedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticatedRef.current = true;
      return;
    }
    if (!wasAuthenticatedRef.current) return;
    wasAuthenticatedRef.current = false;

    debouncedDraftSave.cancel();
    lastConfirmationSigRef.current = "";
    lastDraftSigRef.current = "";
    offeredEmailsRef.current.clear();
    restoreMosaicStartedRef.current = false;
    setLastSavedCheckpoint(null);
    setSaveStatus("idle");
    setPendingResume(null);
    setIsRestoring(false);
    setActiveProject(null);
    setShouldOfferNaming(false);

    mapContext.resetMapState();
    mg.resetMapGenerationState();
    setSessionId("");
  }, [isAuthenticated, debouncedDraftSave, mapContext, mg, setSessionId]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !user) return;
    if (offeredEmailsRef.current.has(user.email)) return;
    offeredEmailsRef.current.add(user.email);
    void sessionStore.load().then((cp) => {
      let effective = cp;
      if (cp && cp.owner === null) {
        effective = { ...cp, owner: ownerFromUser(user) };
        void sessionStore.save(effective);
      }
      if (shouldOfferResume(effective, user, sessionId)) {
        setPendingResume(effective);
      }
    });
  }, [isHydrated, isAuthenticated, user, sessionId]);

  const restoreSession = useCallback(
    (cp: SessionCheckpoint) => {
      setSessionId(cp.sessionId);
      mg.setStepKey(cp.stepKey);
      mg.setProgressPanelIndex(cp.progressPanelIndex);

      const { basicInfo } = cp;
      if (basicInfo) {
        mg.setAreaScopingType(basicInfo.areaScopingType as AREA_SCOPING_TYPE);
        mg.setAreaScopingPolygonArea(basicInfo.polygonArea);
        mg.setAreaScopingPolygonFileName(basicInfo.polygonFileName);
        mg.setAreaScopingPolygonFileSize(basicInfo.polygonFileSize);
        mg.setPolygonData(basicInfo.polygonData);
        mg.setAreaScopingRegency(basicInfo.regency ?? null);
        mg.setSpatialResolution(basicInfo.spatialResolution);
        mg.setTemporalCoverage(basicInfo.temporalCoverage);
        mg.setTemporalCoverageUnit(basicInfo.temporalCoverageUnit);
        mg.setisEditingTemporalCoverage(basicInfo.temporalCoverage === "");
        mg.setSatelliteSource(basicInfo.satelliteSource);
        mg.setMaximumCloudCover(basicInfo.maximumCloudCover);
        mg.setIsEditingSatelliteComposite(false);
        if (basicInfo.polygonGeoJSON) {
          try {
            const geometry = new GeoJSON().readGeometry(
              basicInfo.polygonGeoJSON,
            ) as Polygon | MultiPolygon;
            mapContext.setPolygon(geometry);
            if (mapContext.vectorSource) {
              mapContext.vectorSource.clear();
              mapContext.vectorSource.addFeature(new Feature({ geometry }));
            }
            mapContext.mapInstance?.getView().fit(geometry.getExtent(), {
              padding: [80, 80, 80, 80],
              duration: 500,
            });
          } catch {
          }
        }
        // Re-fetch the satellite composite (GEE tile URLs are transient and
        // never persisted). isRestoring blocks all input until it finishes.
        if (cp.sessionId && basicInfo.temporalCoverage) {
          setIsRestoring(true);
          restoreMosaicStartedRef.current = false;
          void mapContext.getMosaicMap({
            sessionId: cp.sessionId,
            startDate: getTemporalRangeDateStart(
              basicInfo.temporalCoverage,
              basicInfo.temporalCoverageUnit,
            ),
            endDate: getTemporalRangeDateEnd(
              basicInfo.temporalCoverage,
              basicInfo.temporalCoverageUnit,
            ),
            landsatVersion: basicInfo.satelliteSource,
            cloudCover: basicInfo.maximumCloudCover,
            spatialResolution: basicInfo.spatialResolution,
          });
        }
      }

      const { luc } = cp;
      if (luc) {
        mg.setLucQuickRows(luc.lucQuickRows);
        mg.setDefaultArray(luc.defaultArray);
        mg.setClassArray(luc.classArray);
        mg.setLucView(luc.lucView as LucView);
        mg.setLucCustomTab(luc.lucCustomTab as LucCustomTab);
        mg.setLucQuickPhase(luc.lucQuickPhase as LucQuickPhase);
        mg.setLucExcelConfirmed(luc.lucExcelConfirmed);
        mg.setLucDefaultConfirmed(luc.lucDefaultConfirmed);
        mg.setLUCFilename(luc.LUCfilename);
        mg.setLUCFilesize(luc.LUCfilesize);
        if (luc.lucSource === "excel") {
          mg.setLUCFile(new File([], luc.LUCfilename || "template.xlsx"));
        }
        mg.setIsDefineLULCChanged(false);
        // Same derivation as the step 2 → 3 transition: quick flow with no
        // auto-placed points means the user samples manually on step 3.
        mg.setQuickManualSampling(
          luc.lucSource === "quick" && (cp.training?.markers.length ?? 0) === 0,
        );
      }

      const { training } = cp;
      if (training) {
        mg.setDataTrainingActiveTab(training.method as DataTrainingActiveTab);
        const markers = training.markers.map((m) => ({ ...m })) as Marker[];
        mapContext.setMarkerArray(markers);
        mapContext.renderArrayToMarkerVector(markers);
        // Past step 3 the sampling pins are hidden (same as the normal
        // step 3 → 4 transition, see DataTrainingComponent footer).
        if (panelToWizardStep(cp.stepKey) >= 4) {
          mapContext.markerVectorLayer?.setOpacity(0);
        }
        mg.setUploadedFilesArray(
          training.uploadedFiles.map((f) => ({
            file: new File([], f.name),
            filename: f.name,
            filesize: f.size,
            training_data: [],
          })),
        );
        mg.setSampleQualityConfirmed(training.sampleQualityConfirmed);
        // Unconfirmed markers (auto-placed or in-progress OSS pins) are
        // restored too, but step 3 still requires the user's confirmation.
        mg.setIsTrainingDataChanged(!training.confirmed);
      }

      const { params } = cp;
      if (params) {
        mg.setSelectedPredictors(params.selectedPredictors);
        mg.setNumberOfTrees(params.numberOfTrees);
        mg.setMinLeafPopulation(params.minLeafPopulation);
        if (typeof params.splitRatio === "number") {
          mg.setSplitRatio(params.splitRatio);
        }
        mg.setIsLULCParamsChanged(false);
      }

      const { drafts } = cp;
      if (drafts?.luc) {
        mg.setLucQuickRows(drafts.luc.lucQuickRows);
        mg.setDefaultArray(drafts.luc.defaultArray);
        mg.setLucView(drafts.luc.lucView as LucView);
        mg.setLucCustomTab(drafts.luc.lucCustomTab as LucCustomTab);
      }
      if (drafts?.params) {
        mg.setSelectedPredictors(drafts.params.selectedPredictors);
        mg.setNumberOfTrees(drafts.params.numberOfTrees);
        if (typeof drafts.params.splitRatio === "number") {
          mg.setSplitRatio(drafts.params.splitRatio);
        }
      }

      lastConfirmationSigRef.current = "";
      lastDraftSigRef.current = "";
      setLastSavedCheckpoint(cp);
      setSaveStatus("saved");
      setPendingResume(null);
    },
    [mapContext, mg, setSessionId],
  );

  // End the blocking restore phase once the mosaic fetch completes
  // (isMosaicLoading goes true on start and false in getMosaicMap's finally).
  useEffect(() => {
    if (!isRestoring) return;
    if (mapContext.isMosaicLoading) {
      restoreMosaicStartedRef.current = true;
      return;
    }
    if (restoreMosaicStartedRef.current) {
      restoreMosaicStartedRef.current = false;
      setIsRestoring(false);
    }
  }, [isRestoring, mapContext.isMosaicLoading]);

  const resumePendingSession = useCallback(() => {
    if (!pendingResume) return;
    restoreSession(pendingResume);

    const linked = activeProjectStore.loadFor(pendingResume.sessionId);
    if (linked) {
      setActiveProject(linked);
    } else {
      setShouldOfferNaming(true);
    }
  }, [pendingResume, restoreSession]);

  const discardPendingSession = useCallback(() => {
    setPendingResume(null);
    void sessionStore.clear();
    activeProjectStore.clear();
  }, []);

  const clearCheckpoint = useCallback(() => {
    debouncedDraftSave.cancel();
    lastConfirmationSigRef.current = "";
    lastDraftSigRef.current = "";
    setLastSavedCheckpoint(null);
    setSaveStatus("idle");
    void sessionStore.clear();
    // Starting over detaches the project too, otherwise the fresh work would
    // keep syncing into it. The project itself stays in the user's list.
    activeProjectStore.clear();
    setActiveProject(null);
    setShouldOfferNaming(false);
  }, [debouncedDraftSave]);

  const canNameProject =
    isAuthenticated && activeProject === null && candidate !== null;

  const createNamedProject = useCallback(
    async (name: string): Promise<boolean> => {
      const cp = candidateRef.current;
      if (!cp || !isAuthenticated) return false;
      try {
        const created = await createProject(name, cp.sessionId, {
          ...cp,
          savedAt: new Date().toISOString(),
        });
        const project: ActiveProject = {
          id: created.id,
          name: created.name,
          sessionId: created.session_id,
        };
        activeProjectStore.save(project);
        setActiveProject(project);
        setShouldOfferNaming(false);
        setSaveStatus("saved");
        return true;
      } catch {
        setSaveStatus("error");
        return false;
      }
    },
    [isAuthenticated],
  );

  const openProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const detail = await getProject(id);
        // Validate before touching anything: a failed open must not wipe the
        // current work.
        if (!isValidCheckpoint(detail.checkpoint)) return false;

        // Drop any draft queued for the project being left, then start from a
        // clean slate: restoreSession only sets what the checkpoint contains,
        // so leftovers from the previous project would leak into this one.
        debouncedDraftSave.cancel();
        mapContext.resetMapState();
        mg.resetMapGenerationState();

        const project: ActiveProject = {
          id: detail.id,
          name: detail.name,
          sessionId: detail.session_id,
        };
        activeProjectStore.save(project);
        setActiveProject(project);
        setShouldOfferNaming(false);
        restoreSession(detail.checkpoint);
        return true;
      } catch {
        return false;
      }
    },
    [debouncedDraftSave, mapContext, mg, restoreSession],
  );

  const dismissNamingOffer = useCallback(
    () => setShouldOfferNaming(false),
    [],
  );

  // Manual save for a named project: pushes the current state right away
  // instead of waiting for the next auto-save trigger.
  const saveProjectNow = useCallback(async (): Promise<ManualSaveResult> => {
    const cp = candidateRef.current;
    if (!cp || !activeProjectRef.current) return "nothing";
    // The candidate already contains the pending drafts.
    debouncedDraftSave.cancel();
    return (await writeCheckpoint(cp)) ? "saved" : "failed";
  }, [debouncedDraftSave, writeCheckpoint]);

  const recordedSteps = useMemo(
    () => [
      Boolean(lastSavedCheckpoint?.basicInfo),
      Boolean(lastSavedCheckpoint?.luc),
      Boolean(lastSavedCheckpoint?.training?.confirmed),
      Boolean(lastSavedCheckpoint?.params),
      Boolean(lastSavedCheckpoint?.mapGenerated),
    ],
    [lastSavedCheckpoint],
  );

  const providedValue = useMemo(
    () => ({
      saveStatus,
      lastSavedAt: lastSavedCheckpoint?.savedAt ?? null,
      recordedSteps,
      pendingResume,
      isRestoring,
      canSaveProgress,
      hasUnclaimedCheckpoint,
      activeProject,
      canNameProject,
      shouldOfferNaming,
      saveProgress,
      resumePendingSession,
      discardPendingSession,
      clearCheckpoint,
      createNamedProject,
      openProject,
      dismissNamingOffer,
      saveProjectNow,
    }),
    [
      saveStatus,
      lastSavedCheckpoint,
      recordedSteps,
      pendingResume,
      isRestoring,
      canSaveProgress,
      hasUnclaimedCheckpoint,
      activeProject,
      canNameProject,
      shouldOfferNaming,
      saveProgress,
      resumePendingSession,
      discardPendingSession,
      clearCheckpoint,
      createNamedProject,
      openProject,
      dismissNamingOffer,
      saveProjectNow,
    ],
  );

  return (
    <SessionCheckpointContext.Provider value={providedValue}>
      {children}
    </SessionCheckpointContext.Provider>
  );
};

export { SessionCheckpointContext, SessionCheckpointContainer };

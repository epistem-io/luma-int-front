"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
// import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Save, Share2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import { toast } from "sonner"
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";
import { listProjects, type ProjectSummary } from "@/lib/projectsApi";
import LanguageToggle from "./LanguageToggle";
import { SaveProjectDialog } from "./SaveProjectDialog";
import { ShareProjectDialog } from "./ShareProjectDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NavBarProps {
  className?: string;
}

interface MenuItem {
  label: string;
  href: string;
}

const dataMethodsItems: MenuItem[] = [
  { label: "Data Collection", href: "/data-collection" },
  { label: "Data Processing", href: "/data-processing" },
  { label: "Analysis Methods", href: "/analysis-methods" },
  { label: "Validation", href: "/validation" },
];

const getUserInitials = (name?: string, email?: string) => {
  const nameParts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (nameParts.length > 0) {
    return nameParts
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  return (email?.replace(/\s+/g, "").slice(0, 2) ?? "").toUpperCase();
};

export function NavBar({ className }: NavBarProps) {
  const t = useTranslations("LoginModal");
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { setIsLoginModalOpen } = useContext(GlobalContext);
  const tSave = useTranslations("SaveProgress");
  const tProjects = useTranslations("Projects");
  const {
    saveProgress,
    activeProject,
    canNameProject,
    openProject,
    isRestoring,
    shouldOfferNaming,
    dismissNamingOffer,
    saveProjectNow,
  } = useContext(SessionCheckpointContext);
  const userInitials = getUserInitials(user?.name, user?.email);

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [shareTargetId, setShareTargetId] = useState<string | null>(null);
  const [pendingOpenId, setPendingOpenId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refetch whenever the menu opens (and after a project is created/opened
  // while it is open) so the list is never stale.
  useEffect(() => {
    if (!isAuthenticated || !isMenuOpen) return;
    void listProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [isAuthenticated, isMenuOpen, activeProject]);

  const onSaveProjectClick = async () => {
    // Unnamed work: the first save names the project.
    if (canNameProject) {
      setIsSaveDialogOpen(true);
      return;
    }
    if (!activeProject) {
      toast.info(tProjects("nothingToSaveToast"));
      return;
    }
    setIsSavingProject(true);
    const result = await saveProjectNow();
    setIsSavingProject(false);
    if (result === "saved") toast.success(tProjects("savedToast"));
    else if (result === "failed") toast.error(tProjects("saveFailedToast"));
    else toast.info(tProjects("nothingToSaveToast"));
  };

  const openProjectOrToast = async (id: string) => {
    const ok = await openProject(id);
    if (!ok) toast.error(tProjects("openFailedToast"));
  };

  const onOpenProject = (id: string) => {
    if (id === activeProject?.id) return;
    // canNameProject means the current work is unnamed and would be replaced.
    if (canNameProject) {
      setPendingOpenId(id);
      return;
    }
    void openProjectOrToast(id);
  };

  return (
    <nav
      className={cn("z-50 w-full bg-white", className)}
      // className={cn("sticky top-0 z-50 w-full bg-neutral-100", className)}
    >
      <div className="w-full py-2 px-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          {/* External landing page: plain <a> (next-intl's Link would
              locale-prefix it), NEXT_PUBLIC_ so the client bundle sees it. */}
          <a
            href={
              process.env.NEXT_PUBLIC_LANDING_PAGE_URL ??
              "https://epistem.io/id/luma"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-12.5 w-12.5 items-center justify-center rounded-lg overflow-hidden">
                <Image
                  src="/images/logo-epistem.webp"
                  alt="Epistem Logo"
                  width={270}
                  height={265}
                  className="object-contain h-12.5 w-12.5"
                  priority
                />
              </div>
              <div className="space-y-0">
                <h1 className="text-4xl leading-8 tracking-[1.44px] font-medium text-[#0F0A83] font-degular-display-demo">
                  Luma
                </h1>
                <h2 className="text-[14px] leading-3.5 tracking-[0.28px] font-medium text-[#0F0A83] font-degular-display-demo">
                  Land Use Mapping for All
                </h2>
              </div>
            </div>
          </a>

          <div className="flex items-center space-x-5">
            {/* <nav className="flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 font-lato text-md font-regular text-neutral-700-baru transition-colors hover:text-foreground hover:cursor-pointer">
                  <span>Data and Methods</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="">
                  {dataMethodsItems.map((item) => (
                    <div key={item.href}>
                      <Link href={item.href}>
                        <DropdownMenuItem className="hover:cursor-pointer">
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/launch-tool"
                className="font-lato text-md font-regular text-neutral-700-baru transition-colors hover:text-foreground"
              >
                Launch Tool
              </Link>
              <Link
                href="/map-utilization"
                className="font-lato text-md font-regular text-neutral-700-baru transition-colors hover:text-foreground"
              >
                Map Utilization
              </Link>
            </nav> */}

            <LanguageToggle />
            {/* Language Picker */}
            {isAuthenticated ? (
              <>
                {/* Always visible while logged in, so there is one obvious
                    place to save: names the project the first time, then
                    acts as a manual save on top of the auto-sync. */}
                <Button
                  type="button"
                  disabled={isSavingProject}
                  className="rounded-md bg-primary-pink text-white hover:cursor-pointer hover:bg-primary-pink/90"
                  onClick={() => void onSaveProjectClick()}
                >
                  <Save className="h-4 w-4" />
                  {isSavingProject
                    ? tProjects("saving")
                    : tProjects("saveProject")}
                </Button>
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open user menu"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF6FE] font-aptos text-sm font-semibold leading-5 text-primary-pink outline-none transition-colors hover:cursor-pointer hover:bg-[#FFEAFB] focus-visible:ring-2 focus-visible:ring-primary-pink focus-visible:ring-offset-2"
                    >
                      {userInitials || "U"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[16rem] max-w-[20rem]"
                  >
                    <p className="px-2 py-1.5 font-aptos text-xs font-semibold text-neutral-500">
                      {tProjects("myProjects")}
                    </p>
                    {projects.length === 0 && (
                      <p className="px-2 pb-1.5 font-aptos text-xs text-neutral-400">
                        {tProjects("emptyList")}
                      </p>
                    )}
                    <div className="max-h-64 overflow-y-auto">
                      {projects.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          className={cn(
                            "flex items-center justify-between gap-x-2 font-aptos text-sm leading-5 hover:cursor-pointer",
                            project.id === activeProject?.id && "font-semibold",
                          )}
                          onClick={() => onOpenProject(project.id)}
                        >
                          <span className="truncate">
                            {project.name}
                            {project.shared_from && (
                              <span className="ml-1 text-xs font-normal text-neutral-400">
                                ({tProjects("sharedBadge")})
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            aria-label={tProjects("share")}
                            className="shrink-0 rounded p-1 hover:cursor-pointer hover:bg-neutral-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Close the menu first: a Dialog opened over an
                              // open DropdownMenu fights it for focus.
                              setIsMenuOpen(false);
                              setShareTargetId(project.id);
                            }}
                          >
                            <Share2 className="h-3.5 w-3.5 text-primary-pink" />
                          </button>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuItem
                      className="font-aptos text-sm leading-5 text-primary-pink hover:cursor-pointer"
                      onClick={logout}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant={"ghost"}
                  className="text-neutral-700 hover:cursor-pointer"
                  onClick={() => {
                    setIsLoginModalOpen(true);
                  }}
                >
                  {t("title")}
                </Button>
                <Button
                  type="button"
                  className="rounded-md bg-primary-pink text-white hover:cursor-pointer hover:bg-primary-pink/90"
                  onClick={() => {
                    if (saveProgress()) {
                      toast.success(tSave("savedToast"));
                    } else {
                      toast.info(tSave("nothingToSaveToast"));
                    }
                    setIsLoginModalOpen(true);
                  }}
                >
                  <Save className="h-4 w-4" />
                  {tSave("button")}
                </Button>
              </>
            )}
            {/* <div className="flex items-center space-x-2.5 bg-[#FFF6FE] p-2.5">
              <button
                onClick={() => setCurrentLanguage("EN")}
                className={cn(
                  "p-0 text-md font-inter font-medium transition-colors",
                  currentLanguage === "EN"
                    ? "text-[#CC4778] font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                EN
              </button>
              <div className="h-4 w-px bg-border" />
              <button
                onClick={() => setCurrentLanguage("ID")}
                className={cn(
                  "p-0 text-md font-inter font-medium transition-colors",
                  currentLanguage === "ID"
                    ? "text-[#CC4778] font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ID
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Project dialogs (all portal to <body>, so placement is layout-free) */}
      <AlertDialog
        open={pendingOpenId !== null}
        onOpenChange={(o) => !o && setPendingOpenId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tProjects("unsavedSwitchTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tProjects("unsavedSwitchDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tProjects("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const id = pendingOpenId;
                setPendingOpenId(null);
                if (id) void openProjectOrToast(id);
              }}
            >
              {tProjects("openAnyway")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SaveProjectDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
      />
      {/* Post-resume offer; waits for the blocking restore overlay to clear. */}
      <SaveProjectDialog
        open={shouldOfferNaming && !isRestoring && canNameProject}
        onOpenChange={(o) => !o && dismissNamingOffer()}
        title={tProjects("keepDialogTitle")}
      />
      {shareTargetId && (
        <ShareProjectDialog
          projectId={shareTargetId}
          open
          onOpenChange={(o) => !o && setShareTargetId(null)}
        />
      )}
    </nav>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useContext, useEffect, useMemo } from "react";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import { MapContext } from "@/contexts/mapContext";
import { useTranslations } from "next-intl";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { svgWithColor } from "@/lib/utils";

interface Props {
  summary?: boolean;
}

export const LUCClassTable = ({ summary = false }: Props) => {
  const { classArray, summaryData } = useContext(MapGenerationContext);
  const {
    markerArray,
    markerLayerVisibilityArray,
    setMarkerLayerVisibilityArray,
    markerVectorSource,
  } = useContext(MapContext);

  const t = useTranslations("InteractivePanel");

  const rerenderMarkers = (hiddenClassNames: string[]) => {
    if (!markerVectorSource) return;
    markerVectorSource.clear();

    // OSS pins are named "Point N", not by class — so resolve the hidden
    // class names to ids and filter on class_id, which every pin carries.
    const hiddenClassIds = classArray
      .filter((c) => hiddenClassNames.includes(c.class_name))
      .map((c) => c.class_id);

    markerArray.forEach((item) => {
      if (hiddenClassIds.includes(item.class_id)) return;

      const markerFeature = new Feature({
        geometry: new Point(item.coordinates),
        id: item.id,
      });

      markerFeature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: svgWithColor(item.class_color),
            size: [92, 117],
            height: 30,
          }),
        }),
      );
      markerVectorSource.addFeature(markerFeature);
    });
    markerVectorSource.changed();
  };

  useEffect(() => {
    // console.log("marrker", markerArray);
  }, [markerArray]);

  const classArrayCount = useMemo(() => {
    return classArray.map((item) => {
      return {
        class_id: item.class_id,
        class_name: item.class_name,
        class_color: item.class_color,
        count: markerArray.filter(
          (marker) => marker.class_id === item.class_id,
        ).length,
      };
    });
  }, [markerArray, classArray]);

  // useEffect(() => {
  //   console.log("markk", markerLayerVisibilityArray);
  // }, [markerLayerVisibilityArray]);

  return (
    <div className="border border-text-icons-disabled rounded-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-primary-red-pink-light">
          <TableRow>
            {summary && (
              <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center">
                {t("finalSummary.featureID")}
              </TableHead>
            )}
            {!summary && (
              <TableHead className="text-black font-aptos text-xs font-semibold leading-4 text-center w-10 whitespace-normal px-1">
                {t("defineLUC.idClassHeader")}
              </TableHead>
            )}
            <TableHead className="text-black font-aptos text-xs font-semibold leading-4 text-center whitespace-normal px-1">
              {t("dataTraining.lulcClass")}
            </TableHead>
            {!summary && (
              <TableHead className="text-black font-aptos text-xs font-semibold leading-4 text-center w-24 whitespace-normal px-1">
                {t("defineLUC.colorClassHeader")}
              </TableHead>
            )}
            <TableHead className="text-black font-aptos text-xs font-semibold leading-4 text-center w-16 whitespace-normal px-1">
              {t("dataTraining.numberOfPoints")}
            </TableHead>

            {!summary && (
              <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center flex flex-row justify-start">
                <Button
                  variant={"ghost"}
                  className="p-0 rounded-full hover:cursor-pointer text-black!"
                  size={"icon"}
                  onClick={() => {
                    if (markerLayerVisibilityArray.length !== 0) {
                      const temp: string[] = [];
                      setMarkerLayerVisibilityArray(temp);
                      rerenderMarkers(temp);
                    } else {
                      const temp = classArray.map((item) => item.class_name);
                      // temp.push(item.class_name);
                      setMarkerLayerVisibilityArray(temp);
                      rerenderMarkers(temp);
                    }
                  }}
                >
                  {classArray.every((item) =>
                    markerLayerVisibilityArray.includes(item.class_name),
                  ) && <EyeClosedIcon className="" />}
                  {!classArray.every((item) =>
                    markerLayerVisibilityArray.includes(item.class_name),
                  ) && <EyeIcon className="" />}
                </Button>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="text-black font-aptos text-xs font-regular leading-4.5 bg-white">
          {summary && (
            <>
              {summaryData?.data.training_data_summary.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-aptos! text-center border-r">
                    {item.class_id}
                  </TableCell>
                  <TableCell className="font-aptos! text-center border-r">
                    {item.class_name}
                  </TableCell>
                  <TableCell className="font-aptos! text-center max-w-25">
                    {item.total_items}
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
          {!summary && (
            <>
              {classArrayCount.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-aptos! text-center border-r">
                    {item.class_id}
                  </TableCell>
                  <TableCell className="font-aptos! text-center border-r whitespace-normal">
                    {item.class_name}
                  </TableCell>
                  <TableCell className="font-aptos! border-r">
                    <div className="flex items-center justify-start pl-3 gap-x-2">
                      <span
                        className="size-5 shrink-0 rounded-[4px] border border-neutral-300"
                        style={{ backgroundColor: item.class_color }}
                      />
                      <span className="uppercase">
                        {item.class_color.replace(/^#/, "")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-aptos! text-center border-r max-w-25">
                    {item.count}
                  </TableCell>

                  <TableCell className="font-aptos! ">
                    <Button
                      variant={"ghost"}
                      className="p-0 rounded-full hover:cursor-pointer"
                      size={"icon"}
                      onClick={() => {
                        if (
                          markerLayerVisibilityArray.includes(item.class_name)
                        ) {
                          const temp = [...markerLayerVisibilityArray].filter(
                            (item1) => item1 !== item.class_name,
                          );
                          setMarkerLayerVisibilityArray(temp);
                          rerenderMarkers(temp);
                        } else {
                          const temp = [...markerLayerVisibilityArray];
                          temp.push(item.class_name);
                          setMarkerLayerVisibilityArray(temp);
                          rerenderMarkers(temp);
                        }
                      }}
                    >
                      {markerLayerVisibilityArray.includes(item.class_name) && (
                        <EyeClosedIcon className="" />
                      )}
                      {!markerLayerVisibilityArray.includes(
                        item.class_name,
                      ) && <EyeIcon className="" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

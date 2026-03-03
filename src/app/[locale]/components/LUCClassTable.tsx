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

  const rerenderMarkers = (class_names: string[]) => {
    if (!markerVectorSource) return;
    markerVectorSource.clear();

    markerArray.forEach((item) => {
      if (class_names.includes(item.name)) return;
      const markerFeature = new Feature({
        geometry: new Point(item.coordinates),
        id: item.id,
      });
      markerFeature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1], // Anchor the bottom center of the icon
            src: "/images/marker.webp", // Use your own icon URL
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
    // console.log("classarraycount", markerArray);
    return classArray.map((item) => {
      return {
        class_id: item.class_id,
        class_name: item.class_name,
        count: markerArray.filter((marker) => marker.class_id === item.class_id)
          .length,
      };
    });
  }, [markerArray]);

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
                {t("featureID")}
              </TableHead>
            )}
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
            <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center">
              {t("lulcClass")}
            </TableHead>
            <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center w-25">
              {t("numberOfPoints")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-black font-aptos text-xs font-regular leading-4.5 bg-white">
          {summary && (
            <>
              {summaryData?.data.training_data_summary.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-aptos! text-center">
                    {item.class_id}
                  </TableCell>
                  <TableCell className="font-aptos! text-center">
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
                  <TableCell className="font-aptos! text-center">
                    {item.class_name}
                  </TableCell>
                  <TableCell className="font-aptos! text-center max-w-25">
                    {item.count}
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

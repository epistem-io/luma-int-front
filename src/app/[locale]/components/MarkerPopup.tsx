"use client";

import { Button } from "@/components/ui/button";
import { Check, SquarePen } from "lucide-react";
import { useContext, useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapGenerationContext } from "@/contexts/mapGenerationContext";
import Image from "next/image";
import { MapContext } from "@/contexts/mapContext";
import VectorSource from "ol/source/Vector";
import Overlay from "ol/Overlay";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import Point from "ol/geom/Point";

export const MarkerPopup = ({
  markerId,
  markerArray,
  setMarkerArray,
  markerVectorSource,
  markerVectorLayer,
  setMarkerId,
  overlay,
}: {
  markerId: string;
  markerArray: Marker[];
  setMarkerArray: (markerArray: Marker[]) => void;
  markerVectorSource: VectorSource | null;
  markerVectorLayer: VectorLayer | null;
  setMarkerId: (markerId: string) => void;
  overlay: null | Overlay;
}) => {
  const { classArray } = useContext(MapGenerationContext);
  const { mapInstance } = useContext(MapContext);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");

  const el = markerArray.find((item) => item.id === markerId);

  useEffect(() => {
    console.log("markerrid", markerId);
    if (!markerId) return;

    setIsEditing(false);

    const temp = markerArray.find((item) => item.id === markerId);

    if (!temp) return;

    if (temp.class_id === -1) {
      setSelectedClass("");
      setIsEditing(true);
      return;
    }

    setSelectedClass(String(temp?.class_id));
    // setSelectedClass()
  }, [markerId]);

  const onClickDelete = () => {
    const newMarkerArray = markerArray.filter((item) => item.id !== markerId);
    // console.log(newMarkerArray);
    setMarkerArray(newMarkerArray);

    if (!markerVectorSource) return;

    markerVectorSource.clear();

    markerArray.forEach((item) => {
      if (item.id === markerId) return;

      const markerFeature = new Feature({
        geometry: new Point(item.coordinates),
        id: item.id,
      });

      markerVectorSource?.addFeature(markerFeature);
    });

    markerVectorSource.changed();

    setMarkerId("");
    overlay?.setPosition(undefined);
  };

  const onSelectChange = (value: string) => {
    // console.log("markerrid", markerId);
    if (!markerId) {
      setSelectedClass("");
      return;
    }

    // console.log("markerarr", markerArray);
    const index = markerArray.findIndex((item) => item.id === markerId);

    // console.log("indexx", index);

    if (index === -1) return;

    const temp = { ...markerArray[index] };
    temp.class_id = Number(value);

    const newMarkerArray = [...markerArray];
    newMarkerArray[index] = temp;

    // console.log("newmarkerarray", newMarkerArray);

    setMarkerArray([...newMarkerArray]);

    setSelectedClass(value);
  };

  return (
    <>
      <div className="z-20 w-[150px] rounded-2xl p-3 border-2 border-primary-red-pink-normal bg-white">
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-row justify-between">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px]">
              {el?.name}
            </p>
            {isEditing && (
              <Button
                variant={"primary"}
                size={"icon-sm"}
                onClick={() => {
                  if (!selectedClass) return;

                  setIsEditing(!isEditing);
                  setMarkerId("");
                  overlay?.setPosition(undefined);
                }}
                className=""
              >
                <Check className="text-white size-4.5" />
              </Button>
            )}
            {!isEditing && (
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={() => setIsEditing(!isEditing)}
                // className="p-0.5"
              >
                <SquarePen className="text-text-icons-base-main size-4.5" />
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <p className="font-aptos text-[15px] font-regular leading-4.5">
              LULC Class
            </p>
            <Select value={selectedClass} onValueChange={onSelectChange}>
              <SelectTrigger disabled={!isEditing} className="w-full">
                <SelectValue placeholder="Select Temporal Coverage" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {classArray.map((item) => (
                  <SelectItem
                    key={`key-${item.class_id}`}
                    value={String(item.class_id)}
                    // disabled={item.disabled}
                  >
                    {item.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isEditing && (
            <div className="w-full">
              <p
                onClick={() => {
                  onClickDelete();
                }}
                className="text-text-icons-danger font-aptos text-[13px] font-regular leading-4.5 underline text-center cursor-pointer"
              >
                Delete Point
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex flex-row justify-center items-center -mt-1">
        <Image
          className="h-6 w-10"
          alt="triange"
          src="/svgs/triangle.svg"
          height={12}
          width={24}
        />
      </div>
    </>
  );
};

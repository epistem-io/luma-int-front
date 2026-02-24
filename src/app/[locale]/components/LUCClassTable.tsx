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

export const LUCClassTable = () => {
  const { classArray } = useContext(MapGenerationContext);
  const { markerArray } = useContext(MapContext);

  useEffect(() => {
    // console.log("marrker", markerArray);
  }, [markerArray]);

  const classArrayCount = useMemo(() => {
    console.log("classarraycount", markerArray);
    return classArray.map((item) => {
      return {
        class_id: item.class_id,
        class_name: item.class_name,
        count: markerArray.filter((marker) => marker.class_id === item.class_id)
          .length,
      };
    });
  }, [markerArray]);

  return (
    <div className="border border-text-icons-disabled rounded-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-primary-red-pink-light">
          <TableRow>
            <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 ">
              <Checkbox />
            </TableHead>
            <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center">
              LULC Class
            </TableHead>
            <TableHead className="text-black font-aptos text-xs font-semibold leading-4.5 text-center w-25">
              Numbers of Point
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-black font-aptos text-xs font-regular leading-4.5 bg-white">
          {classArrayCount.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-aptos! ">
                <Checkbox />
              </TableCell>
              <TableCell className="font-aptos! text-center">
                {item.class_name}
              </TableCell>
              <TableCell className="font-aptos! text-center max-w-25">
                {item.count}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

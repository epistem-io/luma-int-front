"use client";

import { Button } from "@/components/ui/button";
import { AccordionContent } from "@radix-ui/react-accordion";
import Image from "next/image";
import { ConfirmDialog } from "./ConfirmDialog";
import { useState } from "react";

interface Props {
  areaSizeString: string;
  accordion?: boolean;
  isEditing?: boolean;
  onClickEdit?: () => void;
}

export const AreaScopingSummary = ({
  areaSizeString,
  accordion = true,
  isEditing = false,
  onClickEdit,
}: Props) => {
  if (!accordion && !onClickEdit) {
    return "Error";
  }

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  return (
    <>
      {accordion && (
        <div className="px-3 py-3 rounded-[12px] border-2 border-dashed border-secondary-purple-light-active bg-purple-second">
          not yet
        </div>
      )}
      {!accordion && (
        <>
          <div className="space-y-2 relative">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              Area of Interest
            </p>
            <div className="gap-y-5 grid grid-cols-2">
              <div className="space-y-0 col-span-2">
                <p className="font-aptos text-[15px] font-semibold leading-5.5 text-text-icons-base-second">
                  Your selected area has total area approximately:
                </p>
                <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-secondary-purple-dark">
                  {areaSizeString}
                </p>
              </div>
            </div>
            {isEditing && (
              <Button
                onClick={() => {
                  setIsConfirmModalVisible(true);
                }}
                variant={"ghost"}
                className="absolute top-0 right-0 p-1 rounded-full cursor-pointer"
                size={"icon"}
              >
                <Image
                  src="/svgs/fa-edit.svg"
                  alt="edit"
                  width={18}
                  height={16}
                  className="h-4 w-4.5"
                />
              </Button>
            )}
          </div>

          <ConfirmDialog
            isVisible={isConfirmModalVisible}
            onCancel={() => {
              setIsConfirmModalVisible(false);
            }}
            onConfirm={() => {
              if (!onClickEdit) return;
              setIsConfirmModalVisible(false);
              onClickEdit();
            }}
            title={"Are You Sure Want to Change the Input?"}
            subtitle="Data yang sudah ada pada part yang anda pilih akan hilang, selain itu akan tetap ada"
            confirmButtonCaption="Change Input"
            cancelButtonCaption="Cancel Change Input"
          />
        </>
      )}
    </>
  );
};

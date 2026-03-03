import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  title: string;
  subtitle: string;
  confirmButtonCaption: string;
  cancelButtonCaption: string;
  onConfirm: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const ConfirmDialog = ({
  title,
  subtitle,
  confirmButtonCaption,
  cancelButtonCaption,
  onConfirm,
  onCancel,
  isVisible,
}: Props) => {
  return (
    <Dialog
      open={isVisible}
      onOpenChange={() => {
        onCancel();
      }}
    >
      <DialogContent className="p-8 max-w-215 w-full rounded-2xl">
        <DialogHeader className="flex flex-col gap-x-3 items-center">
          <DialogTitle className="text-center text-primary-pink font-aptos text-[32px] font-bold tracking-[-0.32px]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center font-aptos text-md font-regular text-text-icons-base-main">
            {subtitle}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-3 mt-15">
          <Button
            onClick={() => {
              onConfirm();
            }}
            variant={"primary"}
          >
            {confirmButtonCaption}
          </Button>
          <Button
            onClick={() => {
              onCancel();
            }}
            variant={"secondary"}
          >
            {cancelButtonCaption}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

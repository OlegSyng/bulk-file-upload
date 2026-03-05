import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "./components/Button";
import { BulkUploadModal } from "./partials/BulkUploadModal";

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-95 flex flex-col items-center justify-center gap-4">
      <Button leadingIcon={<Upload size={16} />} onClick={() => setOpen(true)}>
        Open Bulk Upload
      </Button>

      <BulkUploadModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

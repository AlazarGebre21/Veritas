import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UserPlus,
  Upload,
  MoreHorizontal,
  UserX,
  UserCheck,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import {
  useCandidates,
  useCreateCandidate,
  useUpdateCandidate,
  useDeactivateCandidate,
  useActivateCandidate,
  useDeleteCandidate,
  useBulkUploadCandidates,
} from "../hooks/useCandidates.js";
import { DataTable } from "@/components/shared/DataTable.jsx";
import { Button, Input, Badge, Modal } from "@/components/ui/index.js";
import { formatDate } from "@/lib/utils/date.js";

// ── Zod schema ──────────────────────────────────────────────────────────
const candidateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  externalId: z.string().optional(),
});

// ── Columns ─────────────────────────────────────────────────────────────
const buildColumns = (onAction) => [
  {
    header: "Name",
    accessor: (row) => (
      <div>
        <p className="font-medium text-notion-black text-[14px]">
          {row.firstName} {row.lastName}
        </p>
        {row.externalId && (
          <p className="text-[11px] text-warm-gray-300 font-mono mt-0.5">
            ID: {row.externalId}
          </p>
        )}
      </div>
    ),
  },
  {
    header: "Email",
    accessor: (row) => (
      <span className="text-[13px] text-warm-gray-500">
        {row.email || "—"}
      </span>
    ),
  },
  {
    header: "Status",
    accessor: (row) => (
      <Badge variant={row.isActive ? "success" : "neutral"}>
        {row.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    header: "Added",
    accessor: (row) => (
      <span className="text-[13px] text-warm-gray-500 whitespace-nowrap">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
  {
    header: "",
    className: "w-12",
    accessor: (row) => (
      <CandidateActionMenu candidate={row} onAction={onAction} />
    ),
  },
];

// ── Action dropdown ─────────────────────────────────────────────────────
function CandidateActionMenu({ candidate, onAction }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-micro text-warm-gray-300 hover:text-notion-black hover:bg-warm-white transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-whisper rounded-comfortable shadow-deep py-1">
            <button
              onClick={() => { onAction("edit", candidate); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-warm-gray-500 hover:bg-warm-white hover:text-notion-black transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
            {candidate.isActive ? (
              <button
                onClick={() => { onAction("deactivate", candidate); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-warm-gray-500 hover:bg-warm-white hover:text-notion-black transition-colors"
              >
                <UserX size={14} /> Deactivate
              </button>
            ) : (
              <button
                onClick={() => { onAction("activate", candidate); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-warm-gray-500 hover:bg-warm-white hover:text-notion-black transition-colors"
              >
                <UserCheck size={14} /> Activate
              </button>
            )}
            <button
              onClick={() => { onAction("delete", candidate); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const { data, isLoading } = useCandidates({ page, limit: LIMIT, sort: "created_at", sort_dir: "desc" });
  const candidates = data?.data || [];
  const meta = data?.metadata;

  // ── Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // ── Mutations
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const deactivateCandidate = useDeactivateCandidate();
  const activateCandidate = useActivateCandidate();
  const deleteCandidate = useDeleteCandidate();
  const bulkUpload = useBulkUploadCandidates();

  // ── Action handler
  function handleAction(action, candidate) {
    if (action === "edit") {
      setEditTarget(candidate);
    }
    if (action === "deactivate") {
      if (window.confirm(`Deactivate ${candidate.firstName} ${candidate.lastName}?`)) {
        deactivateCandidate.mutate(candidate.id);
      }
    }
    if (action === "activate") {
      if (window.confirm(`Reactivate ${candidate.firstName} ${candidate.lastName}?`)) {
        activateCandidate.mutate(candidate.id);
      }
    }
    if (action === "delete") {
      if (window.confirm(`Permanently delete ${candidate.firstName} ${candidate.lastName}? This cannot be undone.`)) {
        deleteCandidate.mutate(candidate.id);
      }
    }
  }

  const columns = buildColumns(handleAction);

  // ── Create form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(candidateSchema) });

  function onCreateSubmit(values) {
    createCandidate.mutate(values, {
      onSuccess: () => { setCreateOpen(false); reset(); },
    });
  }

  // ── Edit form
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    reset: editReset,
    formState: { errors: editErrors },
  } = useForm({ resolver: zodResolver(candidateSchema) });

  // Populate edit form when a target is selected
  useEffect(() => {
    if (editTarget) {
      editReset({
        firstName: editTarget.firstName || "",
        lastName: editTarget.lastName || "",
        email: editTarget.email || "",
        externalId: editTarget.externalId || "",
      });
    }
  }, [editTarget, editReset]);

  function onEditSubmit(values) {
    updateCandidate.mutate(
      { id: editTarget.id, payload: values },
      {
        onSuccess: () => {
          setEditTarget(null);
          editReset();
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-whisper pb-6">
        <div>
          <h1 className="text-2xl font-bold text-notion-black">Candidates</h1>
          <p className="text-warm-gray-500 text-[15px] mt-1">
            Manage your candidate pool for exam enrollments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setBulkOpen(true)}>
            <Upload size={16} className="mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus size={16} className="mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={candidates}
        isLoading={isLoading}
        emptyMessage="No candidates yet. Add your first candidate or upload a CSV."
      />

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[13px] text-warm-gray-500">
            Page {meta.current_page} of {meta.total_pages} &middot; {meta.total_elements} total
          </p>
          <div className="flex gap-2">
            <button
              disabled={!meta.has_previous}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-[13px] font-medium rounded-micro border border-whisper text-notion-black hover:bg-warm-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={!meta.has_next}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-[13px] font-medium rounded-micro border border-whisper text-notion-black hover:bg-warm-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Create Candidate Modal ─────────────────────────────────────── */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); reset(); }} title="Add Candidate">
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              id="candidate-firstName"
              placeholder="Jane"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label="Last Name"
              id="candidate-lastName"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>
          <Input
            label="Email"
            id="candidate-email"
            type="email"
            placeholder="jane@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="ID"
            id="candidate-externalId"
            placeholder="Must Be Unique number"
            {...register("externalId")}
          />

          {createCandidate.isError && (
            <p className="text-warning text-[13px]">
              {createCandidate.error?.response?.data?.error || "Failed to create candidate."}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setCreateOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCandidate.isPending}>
              {createCandidate.isPending ? "Creating..." : "Add Candidate"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Candidate Modal ───────────────────────────────────────── */}
      <Modal isOpen={!!editTarget} onClose={() => { setEditTarget(null); editReset(); }} title="Edit Candidate">
        <form onSubmit={editHandleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              id="edit-candidate-firstName"
              placeholder="Jane"
              error={editErrors.firstName?.message}
              {...editRegister("firstName")}
            />
            <Input
              label="Last Name"
              id="edit-candidate-lastName"
              placeholder="Doe"
              error={editErrors.lastName?.message}
              {...editRegister("lastName")}
            />
          </div>
          <Input
            label="Email"
            id="edit-candidate-email"
            type="email"
            placeholder="jane@example.com"
            error={editErrors.email?.message}
            {...editRegister("email")}
          />
          <Input
            label="ID"
            id="edit-candidate-externalId"
            placeholder="Must be Unique"
            {...editRegister("externalId")}
          />

          {updateCandidate.isError && (
            <p className="text-warning text-[13px]">
              {updateCandidate.error?.response?.data?.error || "Failed to update candidate."}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setEditTarget(null); editReset(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCandidate.isPending}>
              {updateCandidate.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Bulk Upload Modal ──────────────────────────────────────────── */}
      <BulkUploadModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        mutation={bulkUpload}
      />
    </div>
  );
}

// ── Bulk Upload Modal Component ─────────────────────────────────────────
function BulkUploadModal({ isOpen, onClose, mutation }) {
  const fileRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file) {
    if (!file) return;
    // Validate: CSV only, max 5 MB
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5 MB.");
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleUpload() {
    if (!selectedFile) return;
    mutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        onClose();
      },
    });
  }

  function handleClose() {
    setSelectedFile(null);
    mutation.reset();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Upload Candidates">
      <div className="space-y-4">
        <p className="text-[14px] text-warm-gray-500">
          Upload a CSV file with columns: <code className="text-[13px] bg-warm-white px-1.5 py-0.5 rounded-micro font-mono leading-loose">id(required), first_name(required), last_name(required), email(required)</code>
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-comfortable p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-notion-blue bg-notion-blue/5"
              : "border-whisper hover:border-warm-gray-300 bg-warm-white/50"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <FileSpreadsheet size={32} className="mx-auto text-warm-gray-300 mb-3" />
          {selectedFile ? (
            <div>
              <p className="text-[14px] font-medium text-notion-black">{selectedFile.name}</p>
              <p className="text-[12px] text-warm-gray-500 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[14px] text-warm-gray-500">
                Drag and drop a CSV file here, or <span className="text-notion-blue font-medium">browse</span>
              </p>
              <p className="text-[12px] text-warm-gray-300 mt-1">Max file size: 5 MB</p>
            </div>
          )}
        </div>

        {/* Status messages */}
        {mutation.isSuccess && (
          <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-micro">
            <CheckCircle2 size={16} className="text-success shrink-0" />
            <p className="text-[13px] text-success">
              Upload successful! {mutation.data?.message || `${mutation.data?.count || ""} candidates imported.`}
            </p>
          </div>
        )}
        {mutation.isError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-micro">
            <AlertCircle size={16} className="text-destructive shrink-0" />
            <p className="text-[13px] text-destructive">
              {mutation.error?.response?.data?.error || "Upload failed. Please check your CSV format."}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || mutation.isPending}
          >
            {mutation.isPending ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

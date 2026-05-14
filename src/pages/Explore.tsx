import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useDatasets, useDataset } from "@/lib/queries";
import {
  Loader2, Upload, CheckCircle, Shield, Database, FileUp,
  ChevronRight, AlertTriangle, EyeOff, BarChart2, Search,
  Download, Lock, Eye, ArrowLeft, Info, Users, Table2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "visualizer" | "accessor" | "curator" | "admin";
type ImportPhase = "idle" | "uploaded" | "processing" | "anonymizing" | "ready";

interface PrivacyFinding {
  field: string;
  type: "direct" | "quasi" | "sensitive";
  risk: "high" | "medium" | "low";
  action: string;
  before: string;
  after: string;
}

interface ProcessingStep {
  label: string;
  detail: string;
  done: boolean;
  active: boolean;
}

interface MockDataset {
  id: number;
  table_name: string;
  display_name: string;
  description: string;
  rows: number;
  cols: number;
  owner: string;
  created_at: string;
  columns: string[];
  sampleRows: Record<string, string>[];
  accessRoles: Role[];
  ownedBy: Role[];
}

// ─── RBAC config ─────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<Role, {
  label: string;
  color: string;
  bg: string;
  badge: string;
  description: string;
  canUpload: boolean;
  canDownload: boolean;
  canManageGrants: boolean;
  canSeeRawData: boolean;
}> = {
  visualizer: {
    label: "Visualizer",
    color: "text-slate-600",
    bg: "bg-slate-100",
    badge: "bg-slate-200 text-slate-700",
    description: "View catalog & aggregate statistics only — no raw data access",
    canUpload: false, canDownload: false, canManageGrants: false, canSeeRawData: false,
  },
  accessor: {
    label: "Accessor",
    color: "text-blue-700",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    description: "Read datasets explicitly granted by curators or admins",
    canUpload: false, canDownload: true, canManageGrants: false, canSeeRawData: true,
  },
  curator: {
    label: "Curator",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-800",
    description: "Upload & own datasets, grant access, read own + granted datasets",
    canUpload: true, canDownload: true, canManageGrants: true, canSeeRawData: true,
  },
  admin: {
    label: "Admin",
    color: "text-primary",
    bg: "bg-primary/10",
    badge: "bg-primary/20 text-primary",
    description: "Full access — all datasets, all users, all grants",
    canUpload: true, canDownload: true, canManageGrants: true, canSeeRawData: true,
  },
};

// ─── Mock datasets (mirroring real FAIRDatabase _fd schema) ──────────────────

const MOCK_DATASETS: MockDataset[] = [
  {
    id: 1,
    table_name: "mimic3_burn_cohort_p1",
    display_name: "MIMIC-III Burn Cohort",
    description: "ICU burn-injury patient admissions from MIMIC-III (ICD-9 codes)",
    rows: 450,
    cols: 4,
    owner: "data.steward@hospital.org",
    created_at: "2024-11-12",
    columns: ["hadm_id", "primary_burn_code", "inhalation_injury_flag", "icu_admission_flag"],
    accessRoles: ["accessor", "curator", "admin"],
    ownedBy: ["curator", "admin"],
    sampleRows: [
      { hadm_id: "154521", primary_burn_code: "94536", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "186926", primary_burn_code: "94224", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
      { hadm_id: "120074", primary_burn_code: "94214", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "127580", primary_burn_code: "94214", inhalation_injury_flag: "True",  icu_admission_flag: "False" },
      { hadm_id: "198342", primary_burn_code: "94530", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
      { hadm_id: "203871", primary_burn_code: "94220", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "175490", primary_burn_code: "94510", inhalation_injury_flag: "False", icu_admission_flag: "False" },
      { hadm_id: "189023", primary_burn_code: "94536", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "143251", primary_burn_code: "94229", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
      { hadm_id: "210948", primary_burn_code: "94214", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "166702", primary_burn_code: "94224", inhalation_injury_flag: "False", icu_admission_flag: "False" },
      { hadm_id: "154832", primary_burn_code: "94530", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "197345", primary_burn_code: "94536", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
      { hadm_id: "182019", primary_burn_code: "94220", inhalation_injury_flag: "True",  icu_admission_flag: "False" },
      { hadm_id: "228401", primary_burn_code: "94214", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
    ],
  },
  {
    id: 2,
    table_name: "mimic4_burn_cohort_p1",
    display_name: "MIMIC-IV Burn Cohort",
    description: "ICU burn-injury patient admissions from MIMIC-IV (ICD-11 / ICD-10-CM codes)",
    rows: 521,
    cols: 4,
    owner: "data.steward@hospital.org",
    created_at: "2024-12-03",
    columns: ["hadm_id", "primary_burn_code", "inhalation_injury_flag", "icu_admission_flag"],
    accessRoles: ["accessor", "curator", "admin"],
    ownedBy: ["curator", "admin"],
    sampleRows: [
      { hadm_id: "21055850", primary_burn_code: "T23001D", inhalation_injury_flag: "False", icu_admission_flag: "False" },
      { hadm_id: "29009759", primary_burn_code: "T24122A", inhalation_injury_flag: "True",  icu_admission_flag: "False" },
      { hadm_id: "30482913", primary_burn_code: "T23011A", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "12874501", primary_burn_code: "T25311A", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
      { hadm_id: "39201847", primary_burn_code: "T23091D", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "18374650", primary_burn_code: "T24321S", inhalation_injury_flag: "False", icu_admission_flag: "False" },
      { hadm_id: "27654321", primary_burn_code: "T23001A", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "34871092", primary_burn_code: "T25191D", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
      { hadm_id: "20139847", primary_burn_code: "T23011D", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "41029384", primary_burn_code: "T24101A", inhalation_injury_flag: "False", icu_admission_flag: "False" },
      { hadm_id: "15920183", primary_burn_code: "T23091A", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
      { hadm_id: "38476520", primary_burn_code: "T25211A", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
      { hadm_id: "22918374", primary_burn_code: "T23001S", inhalation_injury_flag: "True",  icu_admission_flag: "False" },
      { hadm_id: "31847293", primary_burn_code: "T24122D", inhalation_injury_flag: "False", icu_admission_flag: "True"  },
      { hadm_id: "25039182", primary_burn_code: "T23011S", inhalation_injury_flag: "True",  icu_admission_flag: "True"  },
    ],
  },
  {
    id: 3,
    table_name: "gut_microbiome_p1",
    display_name: "Gut Microbiome — 16S rRNA",
    description: "16S rRNA V3-V4 gut microbiome samples (Illumina MiSeq, 156 subjects)",
    rows: 156,
    cols: 7,
    owner: "microbiome.lab@research.eu",
    created_at: "2024-10-29",
    columns: ["subject_id", "age", "sex", "bmi", "collection_site", "sample_type", "condition"],
    accessRoles: ["accessor", "curator", "admin"],
    ownedBy: ["admin"],
    sampleRows: [
      { subject_id: "S001", age: "34", sex: "M", bmi: "23.1", collection_site: "Amsterdam UMC",  sample_type: "gut",  condition: "healthy" },
      { subject_id: "S002", age: "67", sex: "F", bmi: "28.4", collection_site: "Amsterdam UMC",  sample_type: "gut",  condition: "IBD"     },
      { subject_id: "S003", age: "45", sex: "M", bmi: "31.2", collection_site: "Erasmus MC",     sample_type: "gut",  condition: "obese"   },
      { subject_id: "S004", age: "28", sex: "F", bmi: "21.0", collection_site: "Leiden UMC",     sample_type: "gut",  condition: "healthy" },
      { subject_id: "S005", age: "52", sex: "M", bmi: "26.8", collection_site: "Amsterdam UMC",  sample_type: "oral", condition: "T2D"     },
      { subject_id: "S006", age: "39", sex: "F", bmi: "24.5", collection_site: "Erasmus MC",     sample_type: "oral", condition: "healthy" },
      { subject_id: "S007", age: "61", sex: "M", bmi: "33.1", collection_site: "Leiden UMC",     sample_type: "gut",  condition: "IBD"     },
      { subject_id: "S008", age: "44", sex: "F", bmi: "22.7", collection_site: "Amsterdam UMC",  sample_type: "skin", condition: "healthy" },
      { subject_id: "S009", age: "31", sex: "M", bmi: "29.3", collection_site: "Erasmus MC",     sample_type: "gut",  condition: "obese"   },
      { subject_id: "S010", age: "58", sex: "F", bmi: "27.6", collection_site: "Leiden UMC",     sample_type: "gut",  condition: "T2D"     },
      { subject_id: "S011", age: "42", sex: "M", bmi: "24.1", collection_site: "Amsterdam UMC",  sample_type: "gut",  condition: "healthy" },
      { subject_id: "S012", age: "55", sex: "F", bmi: "30.8", collection_site: "Erasmus MC",     sample_type: "gut",  condition: "IBD"     },
      { subject_id: "S013", age: "37", sex: "M", bmi: "22.4", collection_site: "Leiden UMC",     sample_type: "gut",  condition: "healthy" },
      { subject_id: "S014", age: "49", sex: "F", bmi: "25.9", collection_site: "Amsterdam UMC",  sample_type: "oral", condition: "T2D"     },
      { subject_id: "S015", age: "63", sex: "M", bmi: "32.5", collection_site: "Erasmus MC",     sample_type: "gut",  condition: "obese"   },
    ],
  },
  {
    id: 4,
    table_name: "oral_microbiome_p1",
    display_name: "Oral Microbiome — 16S rRNA",
    description: "16S rRNA V4 oral cavity samples (Illumina NovaSeq, 89 subjects)",
    rows: 89,
    cols: 6,
    owner: "microbiome.lab@research.eu",
    created_at: "2025-01-08",
    columns: ["subject_id", "age", "sex", "sample_site", "ph_level", "condition"],
    accessRoles: ["curator", "admin"],
    ownedBy: ["curator", "admin"],
    sampleRows: [
      { subject_id: "O001", age: "29", sex: "F", sample_site: "buccal mucosa", ph_level: "7.2", condition: "healthy"    },
      { subject_id: "O002", age: "54", sex: "M", sample_site: "subgingival",   ph_level: "6.8", condition: "gingivitis" },
      { subject_id: "O003", age: "41", sex: "F", sample_site: "tongue dorsum", ph_level: "7.1", condition: "healthy"    },
      { subject_id: "O004", age: "66", sex: "M", sample_site: "subgingival",   ph_level: "6.4", condition: "periodont." },
      { subject_id: "O005", age: "35", sex: "F", sample_site: "buccal mucosa", ph_level: "7.3", condition: "healthy"    },
      { subject_id: "O006", age: "48", sex: "M", sample_site: "tongue dorsum", ph_level: "7.0", condition: "candidiasis"},
      { subject_id: "O007", age: "23", sex: "F", sample_site: "subgingival",   ph_level: "7.1", condition: "healthy"    },
      { subject_id: "O008", age: "59", sex: "M", sample_site: "buccal mucosa", ph_level: "6.9", condition: "gingivitis" },
      { subject_id: "O009", age: "37", sex: "F", sample_site: "tongue dorsum", ph_level: "7.2", condition: "healthy"    },
      { subject_id: "O010", age: "71", sex: "M", sample_site: "subgingival",   ph_level: "6.3", condition: "periodont." },
      { subject_id: "O011", age: "44", sex: "F", sample_site: "buccal mucosa", ph_level: "7.4", condition: "healthy"    },
      { subject_id: "O012", age: "52", sex: "M", sample_site: "tongue dorsum", ph_level: "6.7", condition: "candidiasis"},
      { subject_id: "O013", age: "31", sex: "F", sample_site: "subgingival",   ph_level: "7.0", condition: "healthy"    },
      { subject_id: "O014", age: "46", sex: "M", sample_site: "buccal mucosa", ph_level: "7.1", condition: "gingivitis" },
      { subject_id: "O015", age: "38", sex: "F", sample_site: "tongue dorsum", ph_level: "7.2", condition: "healthy"    },
    ],
  },
  {
    id: 5,
    table_name: "skin_microbiome_p1",
    display_name: "Skin Microbiome — 16S rRNA",
    description: "16S rRNA V1-V3 skin microbiome samples (Illumina MiSeq, 234 subjects)",
    rows: 234,
    cols: 6,
    owner: "skin.lab@dermatology.nl",
    created_at: "2025-02-14",
    columns: ["subject_id", "age", "sex", "body_site", "condition", "lesion_area_cm2"],
    accessRoles: ["admin"],
    ownedBy: ["admin"],
    sampleRows: [
      { subject_id: "K001", age: "33", sex: "F", body_site: "antecubital fossa", condition: "healthy",   lesion_area_cm2: "0"    },
      { subject_id: "K002", age: "45", sex: "M", body_site: "popliteal fossa",   condition: "eczema",    lesion_area_cm2: "12.3" },
      { subject_id: "K003", age: "28", sex: "F", body_site: "forehead",          condition: "acne",      lesion_area_cm2: "6.1"  },
      { subject_id: "K004", age: "61", sex: "M", body_site: "antecubital fossa", condition: "psoriasis", lesion_area_cm2: "24.7" },
      { subject_id: "K005", age: "39", sex: "F", body_site: "scalp",             condition: "healthy",   lesion_area_cm2: "0"    },
      { subject_id: "K006", age: "52", sex: "M", body_site: "popliteal fossa",   condition: "eczema",    lesion_area_cm2: "9.8"  },
      { subject_id: "K007", age: "24", sex: "F", body_site: "forehead",          condition: "acne",      lesion_area_cm2: "3.4"  },
      { subject_id: "K008", age: "67", sex: "M", body_site: "antecubital fossa", condition: "psoriasis", lesion_area_cm2: "31.2" },
      { subject_id: "K009", age: "36", sex: "F", body_site: "scalp",             condition: "dandruff",  lesion_area_cm2: "8.5"  },
      { subject_id: "K010", age: "48", sex: "M", body_site: "forehead",          condition: "healthy",   lesion_area_cm2: "0"    },
      { subject_id: "K011", age: "41", sex: "F", body_site: "popliteal fossa",   condition: "eczema",    lesion_area_cm2: "15.6" },
      { subject_id: "K012", age: "55", sex: "M", body_site: "antecubital fossa", condition: "psoriasis", lesion_area_cm2: "18.9" },
      { subject_id: "K013", age: "29", sex: "F", body_site: "scalp",             condition: "healthy",   lesion_area_cm2: "0"    },
      { subject_id: "K014", age: "63", sex: "M", body_site: "forehead",          condition: "acne",      lesion_area_cm2: "2.1"  },
      { subject_id: "K015", age: "44", sex: "F", body_site: "popliteal fossa",   condition: "eczema",    lesion_area_cm2: "11.3" },
    ],
  },
];

// ─── Privacy findings ─────────────────────────────────────────────────────────

const SAMPLE_CSV = `subject_id,age,sex,bmi,collection_site,sample_type,condition
S001,34,M,23.1,Amsterdam UMC,gut,healthy
S002,67,F,28.4,Amsterdam UMC,gut,IBD
S003,45,M,31.2,Erasmus MC,gut,obese
S004,28,F,21.0,Leiden UMC,gut,healthy
S005,52,M,26.8,Amsterdam UMC,oral,T2D
S006,39,F,24.5,Erasmus MC,oral,healthy
S007,61,M,33.1,Leiden UMC,gut,IBD
S008,44,F,22.7,Amsterdam UMC,skin,healthy
S009,31,M,29.3,Erasmus MC,gut,obese
S010,58,F,27.6,Leiden UMC,gut,T2D`;

const PRIVACY_FINDINGS: PrivacyFinding[] = [
  { field: "subject_id", type: "direct",    risk: "high",   action: "Pseudonymized",           before: "S001, S002…",             after: "P_a3f2, P_b7c1…"      },
  { field: "age",        type: "quasi",     risk: "medium", action: "Generalized (5-yr bins)", before: "34, 67, 45…",             after: "30–35, 65–70, 45–50…"  },
  { field: "collection_site", type: "quasi", risk: "medium", action: "Generalized (region)",  before: "Amsterdam UMC, Erasmus…",  after: "NL Hospital A, B…"     },
  { field: "bmi",        type: "quasi",     risk: "low",    action: "Categorized",             before: "23.1, 28.4…",             after: "normal, overweight…"   },
];

// ─── Pipeline step ────────────────────────────────────────────────────────────

const PipelineStep = ({ num, title, done, active, last }: {
  num: number; title: string; done: boolean; active: boolean; last?: boolean;
}) => (
  <div className="flex items-center gap-2 flex-1">
    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-all ${
      done ? "bg-emerald-500 text-white" : active ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
    }`}>
      {done ? <CheckCircle className="h-4 w-4" /> : num}
    </div>
    <span className={`text-sm font-medium hidden sm:block ${done || active ? "text-slate-800" : "text-slate-400"}`}>{title}</span>
    {!last && <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />}
  </div>
);

// ─── Table preview panel ──────────────────────────────────────────────────────

const TablePreview = ({ dataset, onClose, roleConfig }: {
  dataset: MockDataset;
  onClose: () => void;
  roleConfig: typeof ROLE_CONFIG[Role];
}) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h3 className="font-semibold text-slate-900 text-sm font-mono">{dataset.table_name}</h3>
          <p className="text-xs text-slate-500">{dataset.display_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {roleConfig.canDownload ? (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            <Download className="h-3 w-3" />
            Download ZIP
          </button>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-400 rounded-md cursor-not-allowed">
            <Lock className="h-3 w-3" />
            Download restricted
          </span>
        )}
      </div>
    </div>

    {/* Stats bar */}
    <div className="flex gap-6 px-5 py-3 bg-white border-b border-slate-100 text-sm">
      <div><span className="text-slate-500">Rows: </span><span className="font-semibold text-slate-900">{dataset.rows.toLocaleString()}</span></div>
      <div><span className="text-slate-500">Columns: </span><span className="font-semibold text-slate-900">{dataset.cols}</span></div>
      <div><span className="text-slate-500">Owner: </span><span className="font-mono text-slate-700 text-xs">{dataset.owner}</span></div>
      <div><span className="text-slate-500">Updated: </span><span className="font-semibold text-slate-900">{dataset.created_at}</span></div>
    </div>

    {/* Data or locked */}
    {roleConfig.canSeeRawData ? (
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-slate-50">
              {dataset.columns.map(col => (
                <th key={col} className="px-4 py-2.5 text-left font-semibold text-slate-600 border-b border-slate-200 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.sampleRows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                {dataset.columns.map(col => (
                  <td key={col} className="px-4 py-2 border-b border-slate-100 text-slate-700 whitespace-nowrap">
                    {col.includes("flag")
                      ? <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          row[col] === "True" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>{row[col]}</span>
                      : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
          Showing first 15 of {dataset.rows.toLocaleString()} rows · {dataset.cols} columns
        </p>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <Lock className="h-10 w-10 opacity-40" />
        <p className="font-medium">Raw data access restricted</p>
        <p className="text-sm">Visualizers see aggregate statistics only. Request access from a curator or admin.</p>
      </div>
    )}
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

interface TaxaChartData { name: string; value: number; color: string; }

const Explore = () => {
  // ── Role ─────────────────────────────────────────────────────────────────
  const [role, setRole] = useState<Role>("admin");
  const roleConfig = ROLE_CONFIG[role];

  // ── Catalog state ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<MockDataset | null>(null);

  // ── API / analysis state ──────────────────────────────────────────────────
  const [selectedDataset, setSelectedDataset] = useState("gut");
  const [sampleSize, setSampleSize] = useState([100]);
  const { data: datasetsData, isLoading: datasetsLoading } = useDatasets();
  const { data: datasetData, isLoading: datasetLoading } = useDataset(selectedDataset, { max_samples: sampleSize[0] });
  const isLoading = datasetsLoading || datasetLoading;

  // ── Import pipeline state ─────────────────────────────────────────────────
  const [importPhase, setImportPhase] = useState<ImportPhase>("idle");
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [uploadedRowCount, setUploadedRowCount] = useState(0);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [p29Before, setP29Before] = useState(0);
  const [p29After, setP29After] = useState(0);
  const [useImported, setUseImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived catalog ──────────────────────────────────────────────────────
  const visibleDatasets = MOCK_DATASETS.filter(ds => {
    if (role === "admin") return true;
    if (role === "curator") return ds.ownedBy.includes("curator") || ds.accessRoles.includes("curator");
    if (role === "accessor") return ds.accessRoles.includes("accessor");
    return false; // visualizer: catalog view only (no raw data), table list still shown
  });

  const catalogDatasets = role === "visualizer" ? MOCK_DATASETS : visibleDatasets;

  const filteredDatasets = catalogDatasets.filter(ds => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ds.table_name.toLowerCase().includes(q) ||
      ds.display_name.toLowerCase().includes(q) ||
      ds.columns.some(c => c.toLowerCase().includes(q)) ||
      ds.description.toLowerCase().includes(q)
    );
  });

  // ── Pipeline helpers ──────────────────────────────────────────────────────
  const phaseDone = (phase: ImportPhase) => {
    const order: ImportPhase[] = ["idle", "uploaded", "processing", "anonymizing", "ready"];
    return order.indexOf(importPhase) > order.indexOf(phase);
  };
  const phaseActive = (phase: ImportPhase) => importPhase === phase;

  const processCSV = (csv: string, filename: string) => {
    const lines = csv.trim().split("\n");
    const cols = lines[0].split(",");
    setUploadedFilename(filename);
    setUploadedRowCount(lines.length - 1);
    setDetectedColumns(cols);
    setImportPhase("uploaded");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = ev => {
        const wb = XLSX.read(new Uint8Array(ev.target?.result as ArrayBuffer), { type: "array" });
        processCSV(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]), file.name);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = ev => processCSV(ev.target?.result as string, file.name);
      reader.readAsText(file);
    }
  };

  const loadSampleData = () => processCSV(SAMPLE_CSV, "sample_microbiome_data.csv");

  const startProcessing = () => {
    setImportPhase("processing");
    const steps: ProcessingStep[] = [
      { label: "Validating file schema",      detail: `Detected ${detectedColumns.length} columns, ${uploadedRowCount} rows`, done: false, active: true  },
      { label: "Extracting metadata",         detail: "Inferring data types and value ranges",                                 done: false, active: false },
      { label: "FAIR compliance check",       detail: "Checking interoperability standards (FAIR v1.1)",                       done: false, active: false },
      { label: "Indexing for search",         detail: "Building metadata index in _fd schema",                                 done: false, active: false },
    ];
    setProcessingSteps(steps);
    let i = 0;
    const advance = () => {
      setProcessingSteps(prev => prev.map((s, idx) => ({ ...s, done: idx < i, active: idx === i })));
      i++;
      if (i <= steps.length) setTimeout(advance, 700);
      else setTimeout(() => { setP29Before(74); setImportPhase("anonymizing"); }, 400);
    };
    setTimeout(advance, 400);
  };

  const applyAnonymization = () => {
    setP29After(91);
    setImportPhase("ready");
    setUseImported(true);
  };

  // ── Analysis helpers ──────────────────────────────────────────────────────
  const getTaxaChartData = (): TaxaChartData[] => {
    if (!datasetData?.metadata?.taxa_abundance) return [];
    const colors = ["#0891B2", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280", "#ef4444", "#06b6d4"];
    return datasetData.metadata.taxa_abundance.map((taxon, i) => ({
      name: taxon.taxon,
      value: Math.round(taxon.abundance * 10) / 10,
      color: colors[i % colors.length],
    }));
  };

  const getAlphaDiversityData = () => {
    if (!datasetData?.metadata?.alpha_diversity) return [];
    const div = datasetData.metadata.alpha_diversity;
    const groups = Object.keys(div).filter(k => k !== "overall");
    return (groups.length > 0 ? groups : ["overall"]).map(g => ({
      group: g.charAt(0).toUpperCase() + g.slice(1),
      shannon: div[g].shannon || 0,
      simpson: div[g].simpson || 0,
    }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <div className="pt-20 container mx-auto px-4 py-8">

        {/* ══ Page header ══ */}
        <div className="mb-6 pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Explore FAIRDatabase</h1>
            <p className="text-slate-500">
              Interactive demo — browse the dataset catalog, preview data, run the privacy pipeline, and explore analytics.
            </p>
          </div>

          {/* Role switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Demo role:
            </span>
            <Select value={role} onValueChange={v => { setRole(v as Role); setSelectedTable(null); }}>
              <SelectTrigger className="h-8 text-xs w-36 border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_CONFIG) as Role[]).map(r => (
                  <SelectItem key={r} value={r} className="text-xs">
                    {ROLE_CONFIG[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleConfig.badge}`}>
              {roleConfig.label}
            </span>
          </div>
        </div>

        {/* Role info banner */}
        <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border mb-6 ${roleConfig.bg} border-current/10`}>
          <Info className={`h-4 w-4 mt-0.5 shrink-0 ${roleConfig.color}`} />
          <div>
            <p className={`text-sm font-medium ${roleConfig.color}`}>{roleConfig.label} role</p>
            <p className={`text-xs mt-0.5 opacity-80 ${roleConfig.color}`}>{roleConfig.description}</p>
          </div>
          <div className="ml-auto flex gap-3 text-xs shrink-0">
            {[
              { label: "Upload",   ok: roleConfig.canUpload         },
              { label: "Download", ok: roleConfig.canDownload       },
              { label: "Raw data", ok: roleConfig.canSeeRawData     },
              { label: "Grants",   ok: roleConfig.canManageGrants   },
            ].map(({ label, ok }) => (
              <span key={label} className={`flex items-center gap-1 ${ok ? "text-emerald-700" : "text-slate-400"}`}>
                {ok ? <CheckCircle className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ══ Main tabs ══ */}
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="bg-white border border-slate-200 shadow-sm mb-6 grid grid-cols-3 w-full">
            <TabsTrigger value="catalog"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Database className="h-4 w-4" />Dataset Catalog
            </TabsTrigger>
            <TabsTrigger value="privacy"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Shield className="h-4 w-4" />Import & Privacy
            </TabsTrigger>
            <TabsTrigger value="analysis"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <BarChart2 className="h-4 w-4" />Analysis
            </TabsTrigger>
          </TabsList>

          {/* ════ CATALOG TAB ════ */}
          <TabsContent value="catalog" className="space-y-4">

            {selectedTable ? (
              <TablePreview dataset={selectedTable} onClose={() => setSelectedTable(null)} roleConfig={roleConfig} />
            ) : (
              <>
                {/* Search bar */}
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by table name, column, or description…"
                      className="pl-9 bg-white border-slate-200"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {roleConfig.canUpload && (
                    <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap">
                      <Upload className="h-4 w-4" />
                      Upload Dataset
                    </button>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Datasets",      value: filteredDatasets.length,                                          icon: Database },
                    { label: "Total Rows",     value: filteredDatasets.reduce((s, d) => s + d.rows, 0).toLocaleString(), icon: Table2  },
                    { label: "Your Access",    value: role === "admin" ? "All" : `${visibleDatasets.length} datasets`,  icon: Eye     },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3">
                      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="font-semibold text-slate-900 text-sm">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dataset table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Table Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Rows</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Cols</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Owner</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Access</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDatasets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                            No datasets match your search
                          </td>
                        </tr>
                      ) : filteredDatasets.map((ds, i) => {
                        const hasAccess = role === "admin" || visibleDatasets.includes(ds);
                        const isOwned = ds.ownedBy.includes(role as Role);
                        return (
                          <tr key={ds.id} className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${i === filteredDatasets.length - 1 ? "border-b-0" : ""}`}>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedTable(ds)}
                                className="font-mono text-xs text-primary hover:underline font-medium text-left"
                              >
                                {ds.table_name}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell max-w-xs truncate">{ds.description}</td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">{ds.rows.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 hidden sm:table-cell">{ds.cols}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden lg:table-cell">
                              {isOwned
                                ? <span className="text-emerald-700 font-medium">you ({ds.owner.split("@")[0]})</span>
                                : ds.owner.split("@")[0]}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {!hasAccess ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-xs">
                                  <Lock className="h-3 w-3" /> restricted
                                </span>
                              ) : isOwned ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> owner
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                  <Eye className="h-3 w-3" /> granted
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedTable(ds)}
                                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-primary hover:text-white text-slate-600 rounded transition-colors"
                                >
                                  Preview
                                </button>
                                {roleConfig.canManageGrants && isOwned && (
                                  <button className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors">
                                    Grants
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {role === "visualizer" && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-amber-800">
                      <strong>Visualizer role:</strong> you can see the dataset catalog but cannot access raw data or download. Switch to Accessor, Curator, or Admin above to explore data.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ════ IMPORT & PRIVACY TAB ════ */}
          <TabsContent value="privacy" className="space-y-6">

            {!roleConfig.canUpload && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <Lock className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-amber-800">
                  <strong>{roleConfig.label} role:</strong> upload is restricted to curators and admins. You can still run a read-only demo below.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Import & FAIR Processing Pipeline</h2>
                <p className="text-sm text-slate-500">Upload a dataset to run it through FAIRDatabase and apply privacy-preserving anonymisation</p>
              </div>
              {importPhase !== "idle" && (
                <button onClick={() => { setImportPhase("idle"); setUseImported(false); }} className="text-xs text-slate-400 hover:text-slate-600 underline">
                  Reset
                </button>
              )}
            </div>

            {/* Pipeline progress */}
            {importPhase !== "idle" && (
              <div className="flex items-center gap-0 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <PipelineStep num={1} title="Upload"               done={phaseDone("uploaded")}    active={phaseActive("uploaded")}    />
                <PipelineStep num={2} title="FAIRDatabase Process"  done={phaseDone("processing")}  active={phaseActive("processing")}  />
                <PipelineStep num={3} title="Anonymisation"         done={phaseDone("anonymizing")} active={phaseActive("anonymizing")} />
                <PipelineStep num={4} title="Ready to Explore"     done={false}                    active={phaseActive("ready")}       last />
              </div>
            )}

            {/* Idle */}
            {importPhase === "idle" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                  <FileUp className="h-10 w-10 text-slate-300 group-hover:text-primary mx-auto mb-3 transition-colors" />
                  <p className="font-semibold text-slate-700 group-hover:text-primary">Upload CSV, Excel or JSON</p>
                  <p className="text-sm text-slate-400 mt-1">.csv · .xlsx · .xls · .json</p>
                </div>
                <div
                  onClick={loadSampleData}
                  className="cursor-pointer border-2 border-dashed border-emerald-200 rounded-xl p-10 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all group bg-emerald-50/40"
                >
                  <Database className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                  <p className="font-semibold text-emerald-800">Use Sample Microbiome Dataset</p>
                  <p className="text-sm text-emerald-600 mt-1">10 subjects · gut, oral & skin · CSV</p>
                </div>
              </div>
            )}

            {/* Uploaded */}
            {importPhase === "uploaded" && (
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg"><Upload className="h-6 w-6 text-primary" /></div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{uploadedFilename}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{uploadedRowCount} rows · {detectedColumns.length} columns detected</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {detectedColumns.map(col => (
                          <span key={col} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-mono">{col}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button onClick={startProcessing} className="mt-5 bg-primary hover:bg-primary/90 text-white">
                    <Database className="mr-2 h-4 w-4" />Run Through FAIRDatabase
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Processing */}
            {importPhase === "processing" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />FAIRDatabase Processing
                  </CardTitle>
                  <CardDescription>Validating and indexing your dataset according to FAIR principles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {processingSteps.map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      step.done ? "bg-emerald-50" : step.active ? "bg-primary/5 border border-primary/20" : "bg-slate-50 opacity-50"
                    }`}>
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        step.done ? "bg-emerald-500" : step.active ? "bg-primary" : "bg-slate-200"
                      }`}>
                        {step.done ? <CheckCircle className="h-3.5 w-3.5 text-white" />
                          : step.active ? <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          : <span className="w-2 h-2 rounded-full bg-slate-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{step.label}</p>
                        {(step.done || step.active) && <p className="text-xs text-slate-500">{step.detail}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Anonymizing */}
            {importPhase === "anonymizing" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-500" />Privacy Analysis & Anonymisation
                  </CardTitle>
                  <CardDescription>P29 GDPR compliance scoring and privacy-preserving anonymisation (k-anonymity, differential privacy)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="text-center shrink-0">
                      <p className="text-3xl font-bold text-amber-600">{p29Before}/100</p>
                      <p className="text-xs text-amber-700">P29 Score (before)</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900">Privacy risks detected</p>
                      <p className="text-sm text-amber-700 mt-0.5">
                        {PRIVACY_FINDINGS.filter(f => f.risk === "high").length} high · {PRIVACY_FINDINGS.filter(f => f.risk === "medium").length} medium · {PRIVACY_FINDINGS.filter(f => f.risk === "low").length} low risk
                      </p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                  </div>

                  <div className="space-y-2">
                    {PRIVACY_FINDINGS.map(f => (
                      <div key={f.field} className="grid grid-cols-12 items-center gap-2 text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="col-span-2 font-mono font-medium text-slate-800">{f.field}</div>
                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            f.risk === "high" ? "bg-red-100 text-red-700" : f.risk === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                          }`}>{f.type} · {f.risk}</span>
                        </div>
                        <div className="col-span-2 text-slate-400 text-xs font-mono">{f.before}</div>
                        <div className="col-span-1 text-slate-300 flex justify-center"><EyeOff className="h-3.5 w-3.5" /></div>
                        <div className="col-span-2 text-emerald-700 text-xs font-mono">{f.after}</div>
                        <div className="col-span-3 text-xs text-slate-500 text-right">{f.action}</div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={applyAnonymization} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Shield className="mr-2 h-4 w-4" />Apply Anonymisation & Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Ready */}
            {importPhase === "ready" && (
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-lg"><CheckCircle className="h-6 w-6 text-emerald-600" /></div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-900">Dataset ready for exploration</p>
                      <p className="text-sm text-emerald-700">{uploadedRowCount} samples · anonymised · FAIR-compliant</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-3">
                        <div><p className="text-lg font-bold text-amber-600">74</p><p className="text-xs text-slate-500">P29 Before</p></div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                        <div><p className="text-lg font-bold text-emerald-600">{p29After}</p><p className="text-xs text-slate-500">P29 After</p></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    {[
                      { label: "Direct IDs",  value: "Pseudonymized", icon: EyeOff,   color: "text-blue-600"   },
                      { label: "k-Anonymity", value: "k ≥ 5",         icon: Shield,   color: "text-emerald-600" },
                      { label: "FAIR Score",  value: "A+",             icon: BarChart2, color: "text-purple-600" },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-slate-100">
                        <Icon className={`h-4 w-4 ${color} shrink-0`} />
                        <div>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className={`font-semibold text-sm ${color}`}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ════ ANALYSIS TAB ════ */}
          <TabsContent value="analysis" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {useImported ? "Imported Dataset — Analysis" : "FAIRDatabase — Live Analysis"}
              </h2>
              <p className="text-sm text-slate-500">
                {useImported
                  ? `Showing analysis for your imported and anonymised dataset (${uploadedRowCount} samples)`
                  : "Interactive exploration of FAIRDatabase microbiome datasets"}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dataset Selection</CardTitle>
                      <CardDescription>Choose a microbiome dataset to explore</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {datasetsData?.datasets.map(ds => (
                            <SelectItem key={ds.id} value={ds.id}>{ds.name} ({ds.samples} samples)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sample Size: <span className="font-semibold text-primary">{sampleSize[0]}</span></label>
                        <Slider value={sampleSize} onValueChange={setSampleSize} max={200} min={10} step={10} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dataset Information</CardTitle>
                      <CardDescription>Metadata and statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-xs text-slate-500">Total Samples</p><p className="text-2xl font-bold text-slate-900">{datasetData?.metadata?.total_samples || 0}</p></div>
                        <div><p className="text-xs text-slate-500">Selected</p><p className="text-2xl font-bold text-slate-900">{sampleSize[0]}</p></div>
                      </div>
                      <p className="text-sm text-slate-600">
                        {datasetData
                          ? `16S rRNA data from ${datasetData.dataset} samples, processed using standard bioinformatics pipelines and stored according to FAIR principles.`
                          : "Select a dataset to view its description."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Analyses</CardTitle>
                      <CardDescription>Common analysis workflows</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {["Alpha Diversity Analysis", "Beta Diversity (PCoA)", "Differential Abundance", "Taxonomic Composition"].map(a => (
                        <Button key={a} variant="outline" className="w-full justify-start text-sm hover:text-primary hover:border-primary">{a}</Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Alpha Diversity</CardTitle>
                      <CardDescription>Species richness and evenness metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getAlphaDiversityData().length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={getAlphaDiversityData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="group" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="shannon" fill="#0891B2" name="Shannon Index" radius={[3,3,0,0]} />
                            <Bar dataKey="simpson" fill="#10b981" name="Simpson Index" radius={[3,3,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">No alpha diversity data available</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Taxonomic Composition</CardTitle>
                      <CardDescription>Relative abundance at phylum level</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={getTaxaChartData()} cx="50%" cy="50%" outerRadius={95} dataKey="value" label>
                            {getTaxaChartData().map((entry: TaxaChartData, i: number) => (
                              <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Understanding These Results</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Alpha Diversity</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">Alpha diversity measures within-sample diversity. Higher Shannon and Simpson indices indicate greater microbial richness and evenness — key indicators of microbiome health.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Taxonomic Composition</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">Relative abundance of bacterial phyla reveals characteristic microbial signatures. Compare across conditions or sample sites to identify compositional differences.</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;

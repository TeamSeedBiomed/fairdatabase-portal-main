import { useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Download, Play, Settings, FileText, Activity, Heart, Brain, Wind, Package,
  Upload, CheckCircle, AlertCircle, FlaskConical, Zap, BarChart2
} from "lucide-react";

// ─── Interfaces ────────────────────────────────────────────────────────────

interface Drug {
  id: string;
  name: string;
  class: string;
  mw: number;
  logP: number;
  fup: number;
  pKa: number;
  defaultKa: number;
  defaultKelim: number;
  defaultRb: number;
}

interface ModelParams {
  ka: number;
  kelim: number;
  hepaticCL: number;
  fup: number;
  rb: number;
  partitionCoefficients: { plasma: number; liver: number; gut: number; brain: number; lungs: number; heart: number; };
  organVolumes: { plasma: number; liver: number; gut: number; brain: number; lungs: number; heart: number; };
  bloodFlows: { liver: number; gut: number; brain: number; lungs: number; heart: number; };
}

interface SBMLModelData {
  id: string;
  name: string;
  compartments: { id: string; name: string; size: number; units: string; }[];
  species: { id: string; name: string; compartment: string; initialAmount: number; }[];
  parameters: { id: string; name: string; value: number; units: string; }[];
  reactions: { id: string; name: string; reversible: boolean; }[];
}

interface PBKResults {
  time: number[];
  plasma: number[];
  blood: number[];
  liver: number[];
  gut: number[];
  brain: number[];
  lungs: number[];
  heart: number[];
}

interface ExampleScenario {
  id: string;
  name: string;
  description: string;
  notes: string;
  drug: string;
  dose: number;
  dosingInterval: number;
  route: string;
  simulationTime: number;
  icon: React.ElementType;
  color: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_MODEL_PARAMS: ModelParams = {
  ka: 0.5,
  kelim: 0.05,
  hepaticCL: 0.1,
  fup: 0.5,
  rb: 0.76,
  partitionCoefficients: { plasma: 1, liver: 3, gut: 2, brain: 0.1, lungs: 1.2, heart: 1.5 },
  organVolumes: { plasma: 3, liver: 1.5, gut: 1.0, brain: 1.5, lungs: 0.5, heart: 0.3 },
  bloodFlows: { liver: 90, gut: 60, brain: 45, lungs: 300, heart: 15 },
};

const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    id: "vancomycin_iv",
    name: "Vancomycin IV",
    description: "Standard IV dosing for MRSA",
    notes: "Target AUC₀₋₂₄/MIC ratio 400–600 mg·h/L. Classic q12h regimen.",
    drug: "vancomycin", dose: 1000, dosingInterval: 12, route: "iv", simulationTime: 48,
    icon: FlaskConical, color: "bg-blue-50 border-blue-200 text-blue-900",
  },
  {
    id: "metronidazole_oral",
    name: "Metronidazole Oral TID",
    description: "Oral dosing for C. difficile",
    notes: "Excellent oral bioavailability. Good gut penetration (Kp≈2). TID regimen over 48h.",
    drug: "metronidazole", dose: 400, dosingInterval: 8, route: "oral", simulationTime: 48,
    icon: Package, color: "bg-emerald-50 border-emerald-200 text-emerald-900",
  },
  {
    id: "ciprofloxacin_multidose",
    name: "Ciprofloxacin Multi-dose",
    description: "UTI treatment course — oral q12h",
    notes: "AUC/MIC-dependent killing. Target AUC/MIC >125 h. 4-day course.",
    drug: "ciprofloxacin", dose: 500, dosingInterval: 12, route: "oral", simulationTime: 96,
    icon: BarChart2, color: "bg-purple-50 border-purple-200 text-purple-900",
  },
  {
    id: "rifaximin_gut",
    name: "Rifaximin Gut-Selective",
    description: "Minimal systemic absorption study",
    notes: "Virtually no systemic absorption. High gut concentrations. Ideal for gut microbiome studies.",
    drug: "rifaximin", dose: 550, dosingInterval: 8, route: "oral", simulationTime: 72,
    icon: Zap, color: "bg-amber-50 border-amber-200 text-amber-900",
  },
];

const EXAMPLE_SBML = `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level2/version4" level="2" version="4">
  <model id="vancomycin_pbk" name="Vancomycin PBK Model">
    <listOfCompartments>
      <compartment id="plasma" name="Plasma" size="3.0" units="litre"/>
      <compartment id="liver" name="Liver" size="1.5" units="litre"/>
      <compartment id="gut" name="Gut" size="1.0" units="litre"/>
      <compartment id="brain" name="Brain" size="1.5" units="litre"/>
      <compartment id="lungs" name="Lungs" size="0.5" units="litre"/>
      <compartment id="heart" name="Heart" size="0.3" units="litre"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="drug_plasma" compartment="plasma" initialAmount="0"/>
      <species id="drug_liver" compartment="liver" initialAmount="0"/>
      <species id="drug_gut" compartment="gut" initialAmount="0"/>
      <species id="drug_brain" compartment="brain" initialAmount="0"/>
      <species id="drug_lungs" compartment="lungs" initialAmount="0"/>
      <species id="drug_heart" compartment="heart" initialAmount="0"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="ka" name="Absorption Rate" value="0.5" units="per_hour"/>
      <parameter id="kelim" name="Elimination Rate" value="0.05" units="per_hour"/>
      <parameter id="fup" name="Fraction Unbound" value="0.5" units="dimensionless"/>
      <parameter id="kp_liver" name="Liver Kp" value="3.0" units="dimensionless"/>
      <parameter id="kp_gut" name="Gut Kp" value="2.0" units="dimensionless"/>
      <parameter id="kp_brain" name="Brain Kp" value="0.1" units="dimensionless"/>
      <parameter id="kp_lungs" name="Lungs Kp" value="1.2" units="dimensionless"/>
      <parameter id="kp_heart" name="Heart Kp" value="1.5" units="dimensionless"/>
      <parameter id="Q_liver" name="Liver Blood Flow" value="90" units="litre_per_hour"/>
      <parameter id="Q_brain" name="Brain Blood Flow" value="45" units="litre_per_hour"/>
      <parameter id="Q_lungs" name="Lung Blood Flow" value="300" units="litre_per_hour"/>
      <parameter id="Q_heart" name="Heart Blood Flow" value="15" units="litre_per_hour"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="absorption" name="Gut Absorption" reversible="false"/>
      <reaction id="hepatic_elimination" name="Hepatic Elimination" reversible="false"/>
      <reaction id="renal_elimination" name="Renal Elimination" reversible="false"/>
    </listOfReactions>
  </model>
</sbml>`;

// ─── SBML Parser ───────────────────────────────────────────────────────────

const parseSBML = (xmlString: string): SBMLModelData | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");
    if (doc.querySelector("parsererror")) return null;
    const model = doc.querySelector("model");
    if (!model) return null;

    const compartments = Array.from(doc.querySelectorAll("compartment")).map(c => ({
      id: c.getAttribute("id") || "",
      name: c.getAttribute("name") || c.getAttribute("id") || "",
      size: parseFloat(c.getAttribute("size") || "1"),
      units: c.getAttribute("units") || "litre",
    }));
    const species = Array.from(doc.querySelectorAll("species")).map(s => ({
      id: s.getAttribute("id") || "",
      name: s.getAttribute("name") || s.getAttribute("id") || "",
      compartment: s.getAttribute("compartment") || "",
      initialAmount: parseFloat(s.getAttribute("initialAmount") || s.getAttribute("initialConcentration") || "0"),
      units: s.getAttribute("substanceUnits") || "",
    }));
    const parameters = Array.from(doc.querySelectorAll("parameter")).map(p => ({
      id: p.getAttribute("id") || "",
      name: p.getAttribute("name") || p.getAttribute("id") || "",
      value: parseFloat(p.getAttribute("value") || "0"),
      units: p.getAttribute("units") || "",
    }));
    const reactions = Array.from(doc.querySelectorAll("reaction")).map(r => ({
      id: r.getAttribute("id") || "",
      name: r.getAttribute("name") || r.getAttribute("id") || "",
      reversible: r.getAttribute("reversible") === "true",
    }));

    return {
      id: model.getAttribute("id") || "unnamed",
      name: model.getAttribute("name") || model.getAttribute("id") || "Unnamed Model",
      compartments, species, parameters, reactions,
    };
  } catch {
    return null;
  }
};

// ─── Model Equations (display text) ────────────────────────────────────────

const MODEL_EQUATIONS = {
  plasma: `V_plasma × dC_plasma/dt =
  Σᵢ Qᵢ × (Cᵢ/Kpᵢ - C_plasma)
  - CL_elim × fup × C_plasma`,
  blood: `C_blood = C_plasma × Rb
  Rb = blood:plasma ratio
  accounts for RBC partitioning
  (Rb < 1: plasma-retained;
   Rb > 1: RBC-accumulated)`,
  liver: `V_liver × dC_liver/dt =
  Q_liver × (C_plasma - C_liver/Kp_liver)
  - CL_hepatic × fup × C_liver`,
  gut: `V_gut × dC_gut/dt =
  -ka × C_gut                [oral route]
  +ka × C_gut × fup → plasma [absorption]`,
  brain: `V_brain × dC_brain/dt =
  Q_brain × (C_plasma - C_brain/Kp_brain)`,
  lungs: `V_lungs × dC_lungs/dt =
  Q_lungs × (C_plasma - C_lungs/Kp_lungs)`,
  heart: `V_heart × dC_heart/dt =
  Q_heart × (C_plasma - C_heart/Kp_heart)`,
};

// ─── Component ─────────────────────────────────────────────────────────────

const PBKPage = () => {
  const [selectedDrug, setSelectedDrug] = useState("vancomycin");
  const [dose, setDose] = useState(1000);
  const [dosingInterval, setDosingInterval] = useState(12);
  const [route, setRoute] = useState("iv");
  const [simulationTime, setSimulationTime] = useState(48);
  const [simulationResults, setSimulationResults] = useState<PBKResults | null>(null);
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>(["plasma", "liver", "gut"]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [modelParams, setModelParams] = useState<ModelParams>(DEFAULT_MODEL_PARAMS);
  const [sbmlModel, setSbmlModel] = useState<SBMLModelData | null>(null);
  const [sbmlStatus, setSbmlStatus] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [equations, setEquations] = useState(MODEL_EQUATIONS);
  const [activeTab, setActiveTab] = useState("setup");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drugs: Drug[] = [
    { id: "vancomycin", name: "Vancomycin", class: "Glycopeptide", mw: 1449, logP: -3.1, fup: 0.5, pKa: 2.9, defaultKa: 0.1, defaultKelim: 0.05, defaultRb: 0.76 },
    { id: "metronidazole", name: "Metronidazole", class: "Nitroimidazole", mw: 171, logP: -0.1, fup: 0.1, pKa: 2.6, defaultKa: 1.2, defaultKelim: 0.12, defaultRb: 0.85 },
    { id: "amoxicillin", name: "Amoxicillin", class: "Beta-lactam", mw: 365, logP: 0.9, fup: 0.82, pKa: 2.4, defaultKa: 0.8, defaultKelim: 0.15, defaultRb: 0.75 },
    { id: "ciprofloxacin", name: "Ciprofloxacin", class: "Fluoroquinolone", mw: 331, logP: 0.4, fup: 0.7, pKa: 6.2, defaultKa: 0.6, defaultKelim: 0.08, defaultRb: 1.16 },
    { id: "rifaximin", name: "Rifaximin", class: "Rifamycin", mw: 786, logP: 2.6, fup: 0.02, pKa: 4.4, defaultKa: 0.3, defaultKelim: 0.02, defaultRb: 0.92 },
  ];

  const organMeta = [
    { name: "plasma", label: "Plasma", icon: Activity, color: "#0891B2" },
    { name: "blood", label: "Whole Blood", icon: Activity, color: "#dc2626" },
    { name: "liver", label: "Liver", icon: Activity, color: "#ef4444" },
    { name: "gut", label: "Gut", icon: Package, color: "#10b981" },
    { name: "brain", label: "Brain", icon: Brain, color: "#8b5cf6" },
    { name: "lungs", label: "Lungs", icon: Wind, color: "#f59e0b" },
    { name: "heart", label: "Heart", icon: Heart, color: "#06b6d4" },
  ];

  const drug = drugs.find(d => d.id === selectedDrug);

  // ── Drug selection: seed model params ──────────────────────────────────
  const handleDrugChange = (drugId: string) => {
    setSelectedDrug(drugId);
    const d = drugs.find(x => x.id === drugId);
    if (!d) return;
    setModelParams(prev => ({
      ...prev,
      ka: route === "oral" ? d.defaultKa : 10,
      kelim: d.logP > 0 ? 0.1 : 0.05,
      fup: d.fup,
      rb: d.defaultRb,
    }));
  };

  // ── Load example scenario ───────────────────────────────────────────────
  const loadScenario = (s: ExampleScenario) => {
    setSelectedDrug(s.drug);
    setDose(s.dose);
    setDosingInterval(s.dosingInterval);
    setRoute(s.route);
    setSimulationTime(s.simulationTime);
    const d = drugs.find(x => x.id === s.drug);
    if (d) {
      setModelParams(prev => ({
        ...prev,
        ka: s.route === "oral" ? d.defaultKa : 10,
        kelim: d.logP > 0 ? 0.1 : 0.05,
        fup: d.fup,
        rb: d.defaultRb,
      }));
    }
    setActiveTab("setup");
  };

  // ── SBML Import ─────────────────────────────────────────────────────────
  const handleSBMLFile = (xmlString: string, filename: string) => {
    setSbmlStatus("parsing");
    setTimeout(() => {
      const parsed = parseSBML(xmlString);
      if (!parsed) { setSbmlStatus("error"); return; }
      setSbmlModel(parsed);

      // Map parsed compartments → organVolumes
      const newVolumes = { ...modelParams.organVolumes };
      parsed.compartments.forEach(c => {
        const k = c.id.toLowerCase() as keyof typeof newVolumes;
        if (k in newVolumes && c.size > 0) newVolumes[k] = c.size;
      });

      // Map parsed parameters → modelParams
      let newKa = modelParams.ka, newKelim = modelParams.kelim, newFup = modelParams.fup;
      const newKp = { ...modelParams.partitionCoefficients };
      const newFlows = { ...modelParams.bloodFlows };

      parsed.parameters.forEach(p => {
        if (p.id === "ka") newKa = p.value;
        else if (p.id === "kelim") newKelim = p.value;
        else if (p.id === "fup") newFup = p.value;
        else if (p.id === "kp_liver") newKp.liver = p.value;
        else if (p.id === "kp_gut") newKp.gut = p.value;
        else if (p.id === "kp_brain") newKp.brain = p.value;
        else if (p.id === "kp_lungs") newKp.lungs = p.value;
        else if (p.id === "kp_heart") newKp.heart = p.value;
        else if (p.id === "Q_liver") newFlows.liver = p.value;
        else if (p.id === "Q_brain") newFlows.brain = p.value;
        else if (p.id === "Q_lungs") newFlows.lungs = p.value;
        else if (p.id === "Q_heart") newFlows.heart = p.value;
      });

      setModelParams(prev => ({
        ...prev,
        ka: newKa, kelim: newKelim, fup: newFup,
        partitionCoefficients: newKp,
        organVolumes: newVolumes,
        bloodFlows: newFlows,
      }));
      setSbmlStatus("success");
    }, 800);
    void filename;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => handleSBMLFile(ev.target?.result as string, file.name);
    reader.readAsText(file);
  };

  const loadExampleSBML = () => handleSBMLFile(EXAMPLE_SBML, "vancomycin_pbk.sbml");

  // ── Simulation ──────────────────────────────────────────────────────────
  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const p = modelParams;
      const time: number[] = [];
      const plasma: number[] = [], blood: number[] = [], liver: number[] = [], gut: number[] = [];
      const brain: number[] = [], lungs: number[] = [], heart: number[] = [];

      const ka = route === "oral" ? p.ka : 10;
      const fu = p.fup;
      let cPlasma = 0, cLiver = 0, cGut = 0, cBrain = 0, cLungs = 0, cHeart = 0;
      const dt = 0.1;
      const nDoses = Math.floor(simulationTime / dosingInterval) + 1;
      const doseAmt = dose * 1000;

      for (let t = 0; t <= simulationTime; t += dt) {
        time.push(parseFloat(t.toFixed(1)));

        for (let dn = 0; dn < nDoses; dn++) {
          const doseTime = dn * dosingInterval;
          if (t >= doseTime - dt / 2 && t <= doseTime + dt / 2) {
            if (route === "oral") cGut += doseAmt / p.organVolumes.gut;
            else cPlasma += doseAmt / p.organVolumes.plasma;
          }
        }

        const cp = cPlasma, cl = cLiver, cg = cGut, cb = cBrain, clu = cLungs, ch = cHeart;

        try {
          const Qliver = p.bloodFlows.liver, Qbrain = p.bloodFlows.brain;
          const Qlungs = p.bloodFlows.lungs, Qheart = p.bloodFlows.heart;
          const Vp = p.organVolumes.plasma;

          const dPlasma = ((Qliver * (cl / p.partitionCoefficients.liver - cp)) +
            (Qbrain * (cb / p.partitionCoefficients.brain - cp)) +
            (Qlungs * (clu / p.partitionCoefficients.lungs - cp)) +
            (Qheart * (ch / p.partitionCoefficients.heart - cp)) -
            p.kelim * cp * fu) * dt / Vp;

          const dLiver = (Qliver * (cp - cl / p.partitionCoefficients.liver) -
            p.hepaticCL * cl * fu) * dt / p.organVolumes.liver;

          const dGut = route === "oral" ? (-ka * cg) * dt / p.organVolumes.gut : 0;
          if (route === "oral" && cg > 0) cPlasma += ka * cg * dt * fu / Vp;

          const dBrain = (Qbrain * (cp - cb / p.partitionCoefficients.brain)) * dt / p.organVolumes.brain;
          const dLungs = (Qlungs * (cp - clu / p.partitionCoefficients.lungs)) * dt / p.organVolumes.lungs;
          const dHeart = (Qheart * (cp - ch / p.partitionCoefficients.heart)) * dt / p.organVolumes.heart;

          cPlasma = Math.max(0, cp + dPlasma);
          cLiver = Math.max(0, cl + dLiver);
          cGut = Math.max(0, cg + dGut);
          cBrain = Math.max(0, cb + dBrain);
          cLungs = Math.max(0, clu + dLungs);
          cHeart = Math.max(0, ch + dHeart);
        } catch {
          // keep current values on error
        }

        const safe = (v: number) => (isFinite(v) ? v : 0);
        plasma.push(safe(cPlasma)); blood.push(safe(cPlasma * p.rb));
        liver.push(safe(cLiver)); gut.push(safe(cGut));
        brain.push(safe(cBrain)); lungs.push(safe(cLungs)); heart.push(safe(cHeart));
      }

      setSimulationResults({ time, plasma, blood, liver, gut, brain, lungs, heart });
      setIsSimulating(false);
      setActiveTab("simulation");
    }, 120);
  };

  // ── Chart helpers ───────────────────────────────────────────────────────
  const toMgL = (v: number) => (isFinite(v / 1000) ? v / 1000 : 0);

  const getOrganData = () => {
    if (!simulationResults) return [];
    // Downsample by factor 5 for chart performance
    return simulationResults.time
      .filter((_, i) => i % 5 === 0)
      .map((t, i) => {
        const idx = i * 5;
        return {
          time: t,
          plasma: toMgL(simulationResults.plasma[idx] ?? 0),
          blood: toMgL(simulationResults.blood[idx] ?? 0),
          liver: toMgL(simulationResults.liver[idx] ?? 0),
          gut: toMgL(simulationResults.gut[idx] ?? 0),
          brain: toMgL(simulationResults.brain[idx] ?? 0),
          lungs: toMgL(simulationResults.lungs[idx] ?? 0),
          heart: toMgL(simulationResults.heart[idx] ?? 0),
        };
      });
  };

  const getSelectedOrganData = () => {
    if (!simulationResults) return [];
    return simulationResults.time
      .filter((_, i) => i % 5 === 0)
      .map((t, i) => {
        const idx = i * 5;
        const row: Record<string, number> = { time: t };
        selectedOrgans.forEach(o => {
          row[o] = toMgL((simulationResults[o as keyof PBKResults][idx] as number) ?? 0);
        });
        return row;
      });
  };

  const toggleOrgan = (name: string) =>
    setSelectedOrgans(prev => prev.includes(name) ? prev.filter(o => o !== name) : [...prev, name]);

  const exportResults = () => {
    if (!simulationResults) return;
    const rows = simulationResults.time.map((t, i) =>
      [t, ...["plasma","blood","liver","gut","brain","lungs","heart"].map(k =>
        (simulationResults[k as keyof PBKResults][i] as number / 1000).toFixed(4)
      )].join(",")
    );
    const csv = ["Time (h),Plasma (mg/L),Whole Blood (mg/L),Liver (mg/L),Gut (mg/L),Brain (mg/L),Lungs (mg/L),Heart (mg/L)", ...rows].join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `pbk_${drug?.id ?? "model"}_${new Date().toISOString().slice(0,10)}.csv` });
    a.click();
  };

  // ── Param update helpers ────────────────────────────────────────────────
  const updateKp = (organ: keyof ModelParams["partitionCoefficients"], val: number) =>
    setModelParams(p => ({ ...p, partitionCoefficients: { ...p.partitionCoefficients, [organ]: val } }));
  const updateVol = (organ: keyof ModelParams["organVolumes"], val: number) =>
    setModelParams(p => ({ ...p, organVolumes: { ...p.organVolumes, [organ]: val } }));
  const updateFlow = (organ: keyof ModelParams["bloodFlows"], val: number) =>
    setModelParams(p => ({ ...p, bloodFlows: { ...p.bloodFlows, [organ]: val } }));

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">PBK Simulations</h1>
            </div>
            <p className="text-slate-600 max-w-2xl">
              Physiologically Based Kinetic (PBK) modelling — simulate drug distribution across body
              compartments. Import SBML models or configure parameters directly.
            </p>
          </div>

          {/* ── Example Scenarios ── */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Quick-Start Scenarios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EXAMPLE_SCENARIOS.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => loadScenario(s)}
                    className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${s.color}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-semibold text-sm">{s.name}</span>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">{s.description}</p>
                    <p className="text-xs mt-2 opacity-60 leading-snug">{s.notes}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Main Tabs ── */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-white border border-slate-200 shadow-sm">
              <TabsTrigger value="setup" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Settings className="h-4 w-4" />
                Setup
              </TabsTrigger>
              <TabsTrigger value="equations" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileText className="h-4 w-4" />
                Equations & Parameters
              </TabsTrigger>
              <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Play className="h-4 w-4" />
                Simulation
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <BarChart2 className="h-4 w-4" />
                Results
              </TabsTrigger>
            </TabsList>

            {/* ════ SETUP TAB ════ */}
            <TabsContent value="setup" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Compound Selection */}
                <Card className="border-t-2 border-t-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Compound</CardTitle>
                    <CardDescription>Select a compound for PBK modelling</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedDrug} onValueChange={handleDrugChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {drugs.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name} ({d.class})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {drug && (
                      <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-sm">
                        {[
                          ["Class", drug.class],
                          ["MW", `${drug.mw} g/mol`],
                          ["logP", drug.logP],
                          ["Fraction Unbound", drug.fup],
                          ["pKa", drug.pKa],
                          ["Blood:Plasma Ratio", drug.defaultRb],
                        ].map(([k, v]) => (
                          <div key={String(k)} className="flex justify-between">
                            <span className="text-slate-500">{k}</span>
                            <span className="font-medium text-slate-800">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Dosing Regimen */}
                <Card className="border-t-2 border-t-emerald-500">
                  <CardHeader>
                    <CardTitle className="text-base">Dosing Regimen</CardTitle>
                    <CardDescription>Configure administration parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dose">Dose (mg)</Label>
                      <Input id="dose" type="number" value={dose} onChange={e => setDose(Number(e.target.value))} min={1} max={5000} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interval">Dosing Interval (h)</Label>
                      <Input id="interval" type="number" value={dosingInterval} onChange={e => setDosingInterval(Number(e.target.value))} min={1} max={48} />
                    </div>
                    <div className="space-y-2">
                      <Label>Route of Administration</Label>
                      <Select value={route} onValueChange={v => { setRoute(v); if (drug) setModelParams(p => ({ ...p, ka: v === "oral" ? drug.defaultKa : 10 })); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iv">Intravenous (IV)</SelectItem>
                          <SelectItem value="oral">Oral</SelectItem>
                          <SelectItem value="im">Intramuscular (IM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Simulation Time: <span className="font-semibold">{simulationTime} h</span></Label>
                      <Slider value={[simulationTime]} onValueChange={v => setSimulationTime(v[0])} min={12} max={168} step={12} />
                    </div>
                  </CardContent>
                </Card>

                {/* SBML Import */}
                <Card className="border-t-2 border-t-purple-500">
                  <CardHeader>
                    <CardTitle className="text-base">Import SBML Model</CardTitle>
                    <CardDescription>Load a model file or use a built-in example</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <input ref={fileInputRef} type="file" accept=".sbml,.xml" className="hidden" onChange={handleFileUpload} />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">Drop .sbml / .xml here</p>
                      <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                    </div>

                    <Button variant="outline" className="w-full" onClick={loadExampleSBML}>
                      Load Built-in Example (Vancomycin)
                    </Button>

                    {sbmlStatus === "parsing" && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Parsing SBML…
                      </div>
                    )}
                    {sbmlStatus === "success" && sbmlModel && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          {sbmlModel.name}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-emerald-700 text-xs">
                          <span>{sbmlModel.compartments.length} compartments</span>
                          <span>{sbmlModel.species.length} species</span>
                          <span>{sbmlModel.parameters.length} parameters</span>
                          <span>{sbmlModel.reactions.length} reactions</span>
                        </div>
                        <p className="text-xs text-emerald-600 mt-2">Parameters applied to model.</p>
                      </div>
                    )}
                    {sbmlStatus === "error" && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Could not parse SBML file. Check the XML format.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Button onClick={runSimulation} size="lg" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSimulating}>
                {isSimulating ? (
                  <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Running Simulation…</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" />Run PBK Simulation</>
                )}
              </Button>
            </TabsContent>

            {/* ════ EQUATIONS & PARAMETERS TAB ════ */}
            <TabsContent value="equations" className="space-y-6">

              {/* Rate constants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Kinetic Rate Constants</CardTitle>
                  <CardDescription>These values directly control the simulation. Adjust to tune model behavior.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: "ka", label: "Absorption Rate kₐ", unit: "h⁻¹", min: 0.01, max: 5, step: 0.01 },
                    { key: "kelim", label: "Elimination Rate kₑₗᵢₘ", unit: "h⁻¹", min: 0.001, max: 1, step: 0.001 },
                    { key: "fup", label: "Fraction Unbound (fup)", unit: "—", min: 0.01, max: 1, step: 0.01 },
                    { key: "hepaticCL", label: "Hepatic Clearance", unit: "h⁻¹", min: 0.001, max: 1, step: 0.001 },
                    { key: "rb", label: "Blood:Plasma Ratio (Rb)", unit: "—", min: 0.3, max: 3.0, step: 0.01 },
                  ].map(({ key, label, unit, min, max, step }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Label>{label}</Label>
                        <span className="font-mono font-semibold text-primary">
                          {(modelParams[key as keyof ModelParams] as number).toFixed(3)} <span className="text-slate-400 text-xs">{unit}</span>
                        </span>
                      </div>
                      <Slider
                        value={[(modelParams[key as keyof ModelParams] as number)]}
                        onValueChange={v => setModelParams(p => ({ ...p, [key]: v[0] }))}
                        min={min} max={max} step={step}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Partition coefficients */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tissue-Plasma Partition Coefficients (Kp)</CardTitle>
                  <CardDescription>Ratio of drug concentration in tissue vs. plasma at equilibrium.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {(Object.keys(modelParams.partitionCoefficients) as (keyof ModelParams["partitionCoefficients"])[]).map(organ => (
                    <div key={organ} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <Label className="capitalize">{organ}</Label>
                        <span className="font-mono text-primary font-semibold">{modelParams.partitionCoefficients[organ].toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[modelParams.partitionCoefficients[organ]]}
                        onValueChange={v => updateKp(organ, v[0])}
                        min={0.01} max={10} step={0.01}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Organ volumes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Organ Volumes (L)</CardTitle>
                    <CardDescription>Physiological compartment volumes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(Object.keys(modelParams.organVolumes) as (keyof ModelParams["organVolumes"])[]).map(organ => (
                      <div key={organ} className="flex items-center gap-3">
                        <span className="text-sm capitalize w-16 text-slate-600 shrink-0">{organ}</span>
                        <Slider
                          value={[modelParams.organVolumes[organ]]}
                          onValueChange={v => updateVol(organ, v[0])}
                          min={0.05} max={10} step={0.05}
                          className="flex-1"
                        />
                        <span className="font-mono text-sm text-primary w-14 text-right">
                          {modelParams.organVolumes[organ].toFixed(2)} L
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Blood Flow Rates (L/h)</CardTitle>
                    <CardDescription>Organ perfusion rates controlling drug delivery.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(Object.keys(modelParams.bloodFlows) as (keyof ModelParams["bloodFlows"])[]).map(organ => (
                      <div key={organ} className="flex items-center gap-3">
                        <span className="text-sm capitalize w-16 text-slate-600 shrink-0">{organ}</span>
                        <Slider
                          value={[modelParams.bloodFlows[organ]]}
                          onValueChange={v => updateFlow(organ, v[0])}
                          min={1} max={500} step={1}
                          className="flex-1"
                        />
                        <span className="font-mono text-sm text-primary w-20 text-right">
                          {modelParams.bloodFlows[organ]} L/h
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Model Equations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mass-Balance Differential Equations</CardTitle>
                  <CardDescription>ODE system used in this PBK model. Edit to document custom modifications.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.keys(equations) as (keyof typeof equations)[]).map(organ => (
                    <div key={organ}>
                      <Label className="capitalize text-xs text-slate-500 mb-1 block">{organ} compartment</Label>
                      <textarea
                        className="w-full h-24 p-3 text-xs font-mono bg-[#0D1117] text-[#e6edf3] rounded-lg border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        value={equations[organ]}
                        onChange={e => setEquations(prev => ({ ...prev, [organ]: e.target.value }))}
                        spellCheck={false}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={runSimulation} size="lg" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSimulating}>
                {isSimulating ? (
                  <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Running…</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" />Run Simulation with Current Parameters</>
                )}
              </Button>
            </TabsContent>

            {/* ════ SIMULATION TAB ════ */}
            <TabsContent value="simulation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organ Distribution Over Time</CardTitle>
                  <CardDescription>Drug concentration across all physiological compartments</CardDescription>
                </CardHeader>
                <CardContent>
                  {simulationResults ? (
                    <ResponsiveContainer width="100%" height={420}>
                      <LineChart data={getOrganData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="time" label={{ value: "Time (h)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 12 }} />
                        <YAxis label={{ value: "Conc. (mg/L)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => [`${v.toFixed(3)} mg/L`]} />
                        <Legend />
                        {organMeta.map(o => (
                          <Line key={o.name} type="monotone" dataKey={o.name} stroke={o.color}
                            name={o.label} strokeWidth={2} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                      <FlaskConical className="h-10 w-10 opacity-30" />
                      <p>Run a simulation to see organ distribution</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organ selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Custom Organ Comparison</CardTitle>
                  <CardDescription>Select organs to compare in the chart below</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {organMeta.map(o => {
                      const active = selectedOrgans.includes(o.name);
                      return (
                        <button
                          key={o.name}
                          onClick={() => toggleOrgan(o.name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            active ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: o.color }} />
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                  {simulationResults ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getSelectedOrganData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => [`${v.toFixed(3)} mg/L`]} />
                        <Legend />
                        {selectedOrgans.map(o => {
                          const meta = organMeta.find(m => m.name === o);
                          return (
                            <Line key={o} type="monotone" dataKey={o} stroke={meta?.color ?? "#6b7280"}
                              name={meta?.label ?? o} strokeWidth={2} dot={false} />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                      Run simulation to enable comparison
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════ RESULTS TAB ════ */}
            <TabsContent value="results" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Peak Plasma Cmax", value: simulationResults ? (Math.max(...simulationResults.plasma) / 1000).toFixed(3) : "—", unit: "mg/L" },
                  { label: "Trough Cmin", value: simulationResults ? (Math.min(...simulationResults.plasma.filter(v => v > 0)) / 1000).toFixed(3) : "—", unit: "mg/L" },
                  { label: "AUC₀-t", value: simulationResults ? (simulationResults.plasma.reduce((a, b) => a + b, 0) * 0.1 / 1000).toFixed(1) : "—", unit: "mg·h/L" },
                ].map(({ label, value, unit }) => (
                  <Card key={label} className="border-t-2 border-t-primary">
                    <CardContent className="pt-5">
                      <p className="text-xs text-slate-500 mb-1">{label}</p>
                      <p className="text-3xl font-bold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{unit}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organ-Level Exposure</CardTitle>
                  <CardDescription>AUC, peak, and trough per compartment</CardDescription>
                </CardHeader>
                <CardContent>
                  {simulationResults ? (
                    <div className="space-y-3">
                      {organMeta.map(o => {
                        const data = simulationResults[o.name as keyof PBKResults] as number[];
                        const auc = (data.reduce((a, b) => a + b, 0) * 0.1 / 1000).toFixed(1);
                        const peak = (Math.max(...data) / 1000).toFixed(3);
                        const trough = (Math.min(...data.filter(v => v > 0)) / 1000).toFixed(3);
                        const Icon = o.icon;
                        return (
                          <div key={o.name} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 w-24 shrink-0">
                              <Icon className="h-4 w-4" style={{ color: o.color }} />
                              <span className="text-sm font-medium capitalize">{o.label}</span>
                            </div>
                            <div className="flex gap-6 text-sm flex-1">
                              <div><span className="text-slate-500 text-xs">AUC </span><span className="font-mono font-semibold">{auc}</span></div>
                              <div><span className="text-slate-500 text-xs">Peak </span><span className="font-mono font-semibold">{peak}</span></div>
                              <div><span className="text-slate-500 text-xs">Trough </span><span className="font-mono font-semibold">{trough}</span></div>
                            </div>
                            <span className="text-xs text-slate-400">mg·h/L / mg/L</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-8">Run a simulation to see organ exposure metrics</p>
                  )}
                </CardContent>
              </Card>

              <Button onClick={exportResults} disabled={!simulationResults} variant="outline" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Export PBK Results (CSV)
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PBKPage;

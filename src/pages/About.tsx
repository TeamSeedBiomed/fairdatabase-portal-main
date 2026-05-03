import { Nav } from "@/components/Nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Database, Lock, FileText, Users, Globe } from "lucide-react";

const About = () => {
  const fairPrinciples = [
    {
      letter: "F",
      title: "Findable",
      description: "Data is discoverable through unique identifiers and rich metadata",
      details: [
        "Persistent identifiers (DOIs) for datasets",
        "Comprehensive metadata following MIxS standards",
        "Searchable through multiple interfaces",
        "Indexed in major microbiome data repositories"
      ],
      color: "blue"
    },
    {
      letter: "A",
      title: "Accessible",
      description: "Data is retrievable using standardized protocols",
      details: [
        "RESTful API with OpenAPI specification",
        "Multiple export formats (JSON, CSV, BIOM)",
        "Role-based access control",
        "Long-term archival in public repositories"
      ],
      color: "green"
    },
    {
      letter: "I",
      title: "Interoperable",
      description: "Data integrates with other systems using common formats",
      details: [
        "Standardized taxonomic nomenclature (SILVA, Greengenes)",
        "QIIME2 and Mothur compatible outputs",
        "Integration with EBI/ENA databases",
        "Common data models for microbiome data"
      ],
      color: "purple"
    },
    {
      letter: "R",
      title: "Reusable",
      description: "Data is well-described for future research use",
      details: [
        "Detailed provenance and processing workflows",
        "Quality control metrics and thresholds",
        "Standardized protocols and parameters",
        "Clear licensing (CC BY 4.0)"
      ],
      color: "orange"
    }
  ];

  const gdprFeatures = [
    {
      title: "P29 Scoring System",
      description: "Automated assessment of GDPR compliance for microbiome datasets",
      icon: Shield,
      features: [
        "Detects direct identifiers (names, emails, etc.)",
        "Identifies quasi-identifiers (age, location, etc.)",
        "Calculates re-identification risk scores",
        "Provides compliance recommendations"
      ]
    },
    {
      title: "Privacy-Preserving Transformations",
      description: "Built-in tools to make non-compliant data GDPR-compliant",
      icon: Lock,
      features: [
        "Differential privacy mechanisms",
        "K-anonymity implementation",
        "Automated PII removal",
        "Statistical disclosure control"
      ]
    },
    {
      title: "Data Minimization",
      description: "Collect and store only necessary data",
      icon: Database,
      features: [
        "Purpose limitation enforcement",
        "Storage limitation policies",
        "Automated data retention",
        "Audit trails for all access"
      ]
    }
  ];

  const workflowSteps = [
    {
      step: "1",
      title: "Data Upload",
      description: "Researchers upload raw sequencing data and metadata"
    },
    {
      step: "2",
      title: "GDPR Assessment",
      description: "Automatic P29 scoring identifies privacy risks"
    },
    {
      step: "3",
      title: "Privacy Transformation",
      description: "Optional privacy-preserving transformations applied"
    },
    {
      step: "4",
      title: "FAIR Processing",
      description: "Data processed through standardized bioinformatics pipeline"
    },
    {
      step: "5",
      title: "Metadata Enrichment",
      description: "MIxS-compliant metadata added for FAIR compliance"
    },
    {
      step: "6",
      title: "Secure Storage",
      description: "Data stored in GDPR-compliant Supabase infrastructure"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About FAIRDatabase
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Understanding our approach to FAIR data principles and GDPR compliance in microbiome research
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-600" />
                What is FAIRDatabase?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                FAIRDatabase is a specialized platform for managing microbiome research data according to
                FAIR (Findable, Accessible, Interoperable, Reusable) principles while ensuring GDPR compliance.
                It addresses the unique challenges of handling sensitive biological data in research environments.
              </p>
              <p className="text-gray-700">
                Our platform combines cutting-edge bioinformatics pipelines with privacy-preserving technologies
                to enable responsible data sharing and collaboration in microbiome research.
              </p>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">FAIR Principles Implementation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fairPrinciples.map((principle, index) => (
                <Card key={index} className="border-t-4 border-blue-500">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`bg-${principle.color}-100 text-${principle.color}-800 w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold`}>
                        {principle.letter}
                      </div>
                      <div>
                        <CardTitle>{principle.title}</CardTitle>
                        <CardDescription>{principle.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {principle.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-sm text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">GDPR Compliance Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gdprFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <Icon className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {feature.features.map((f, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Data Processing Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                      {step.step}
                    </div>
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{step.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Privacy by Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Lawful Basis for Processing</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700 mb-2">
                      FAIRDatabase processes personal data based on:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Consent (Article 6.1.a) - Explicit consent from data subjects</li>
                      <li>Legitimate Interest (Article 6.1.f) - Research purposes</li>
                      <li>Public Interest (Article 6.1.e) - Scientific research</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Data Subject Rights</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700 mb-2">
                      We support all GDPR data subject rights:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Right to access (Article 15)</li>
                      <li>Right to rectification (Article 16)</li>
                      <li>Right to erasure ('right to be forgotten') (Article 17)</li>
                      <li>Right to restriction of processing (Article 18)</li>
                      <li>Right to data portability (Article 20)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Security Measures</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700 mb-2">
                      Technical and organizational measures include:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Encryption at rest and in transit (TLS 1.3)</li>
                      <li>Role-based access control (RBAC)</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Automated vulnerability scanning</li>
                      <li>Incident response procedures</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Technical Questions</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    For questions about FAIR implementation or GDPR compliance:
                  </p>
                  <a href="mailto:tech@fairdatabase.org" className="text-blue-600 hover:underline">
                    tech@fairdatabase.org
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Research Collaborations</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Interested in using FAIRDatabase for your research?
                  </p>
                  <a href="mailto:research@fairdatabase.org" className="text-blue-600 hover:underline">
                    research@fairdatabase.org
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;

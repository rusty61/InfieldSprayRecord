import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Download, Eye, Calendar, MapPin, Mail, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Records() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFarm, setFilterFarm] = useState("all");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [exportMode, setExportMode] = useState<"single" | "all" | null>(null);
  const [expandedRecos, setExpandedRecos] = useState<Set<string>>(new Set());

  // todo: remove mock functionality
  const applications = [
    {
      id: "1",
      paddock: "North Field 5",
      farm: "Riverside Farm",
      date: "2025-11-22",
      operator: "John Davis",
      chemicals: ["Glyphosate 540", "Surfactant"],
      area: 12.5,
      waterRate: 80,
      status: "completed",
      recommendations: [
        { id: "r1", agronomer: "Dr. Sarah Green", recommendation: "Reduce water rate by 10% in next application - excellent coverage achieved", priority: "medium" },
        { id: "r2", agronomer: "Dr. Sarah Green", recommendation: "Monitor for runoff on slopes", priority: "high" },
      ],
    },
    {
      id: "2",
      paddock: "South Block A",
      farm: "Riverside Farm",
      date: "2025-11-21",
      operator: "Sarah Mitchell",
      chemicals: ["2,4-D Amine"],
      area: 8.3,
      waterRate: 75,
      status: "completed",
      recommendations: [
        { id: "r3", agronomer: "Dr. Sarah Green", recommendation: "Application timing was optimal. Good control of broadleaf weeds", priority: "low" },
      ],
    },
    {
      id: "3",
      paddock: "East Paddock 12",
      farm: "Hillside Farm",
      date: "2025-11-20",
      operator: "John Davis",
      chemicals: ["Triclopyr", "Surfactant"],
      area: 15.2,
      waterRate: 90,
      status: "completed",
      recommendations: [
        { id: "r4", agronomer: "Dr. Sarah Green", recommendation: "Wind conditions were suboptimal during spray. Consider early morning applications", priority: "high" },
      ],
    },
    {
      id: "4",
      paddock: "West Section 3",
      farm: "Hillside Farm",
      date: "2025-11-19",
      operator: "Sarah Mitchell",
      chemicals: ["Glyphosate 540"],
      area: 6.8,
      waterRate: 70,
      status: "completed",
      recommendations: [],
    },
  ];

  const sendEmailMutation = useMutation({
    mutationFn: async ({ appId, email, isExport }: { appId?: string; email: string; isExport?: boolean }) => {
      if (isExport && exportMode === "all") {
        const response = await fetch(`/api/applications/export/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, applications: filteredApplications }),
        });
        if (!response.ok) {
          throw new Error("Failed to send export");
        }
        return response.json();
      }
      
      const response = await fetch(`/api/applications/${appId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
      return response.json();
    },
    onSuccess: () => {
      const message = exportMode === "all" ? "All records exported and sent to your email successfully." : "Audit report sent to your email successfully.";
      toast({
        title: "Success",
        description: message,
      });
      setEmailDialogOpen(false);
      setEmailAddress("");
      setSelectedAppId(null);
      setExportMode(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    if (!emailAddress) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    if (exportMode === "all") {
      sendEmailMutation.mutate({ email: emailAddress, isExport: true });
    } else if (selectedAppId) {
      sendEmailMutation.mutate({ appId: selectedAppId, email: emailAddress });
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.paddock.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.operator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFarm = filterFarm === "all" || app.farm === filterFarm;
    return matchesSearch && matchesFarm;
  });

  return (
    <div className="min-h-screen pb-20 md:pb-6 text-[#fcb32c] bg-[#000000]">
      <AppHeader title="Records" />
      <main className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto text-[#fcb32c] bg-[#000000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Application Records</h2>
            <p className="text-sm text-muted-foreground">
              View and export spray application history
            </p>
          </div>
          <Link href="/paddocks">
            <Button data-testid="button-new-paddock" className="bg-[#093d2b] text-[#fcb32c]">
              <MapPin className="w-4 h-4 mr-2" />
              New Paddock
            </Button>
          </Link>
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by paddock or operator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#093d2bb3]"
                data-testid="input-search"
              />
            </div>
            <Select value={filterFarm} onValueChange={setFilterFarm}>
              <SelectTrigger className="md:w-[200px] text-[#fcb32c] bg-[#093d2bcc]" data-testid="select-farm-filter">
                <SelectValue placeholder="Filter by farm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farms</SelectItem>
                <SelectItem value="Riverside Farm">Riverside Farm</SelectItem>
                <SelectItem value="Hillside Farm">Hillside Farm</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="text-[#fcb32c]" 
              data-testid="button-export"
              onClick={() => {
                setExportMode("all");
                setEmailDialogOpen(true);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="p-4 md:p-6 text-[#fcb32c]" data-testid={`record-${app.id}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#fcb32c]">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-[#fcb32c]">{app.paddock}</h3>
                      <p className="text-sm text-muted-foreground">{app.farm}</p>
                    </div>
                    <Badge variant="secondary" className="md:hidden">
                      {app.area} ha
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {app.chemicals.map((chemical) => (
                      <Badge key={chemical} variant="outline" className="text-xs text-[#fcb32c]">
                        {chemical}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(app.date).toLocaleDateString("en-AU")}
                    </span>
                    <span>•</span>
                    <span>{app.operator}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline">{app.area} ha</span>
                  </div>
                </div>

                <div className="flex gap-2 text-[#fcb32c]">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`button-view-${app.id}`}
                  >
                    <Eye className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`button-download-${app.id}`}
                  >
                    <Download className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setEmailDialogOpen(true);
                    }}
                    data-testid={`button-email-${app.id}`}
                  >
                    <Mail className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Email</span>
                  </Button>
                </div>
              </div>

              {app.recommendations && app.recommendations.length > 0 && (
                <div className="mt-4 border-t border-[#333] pt-4">
                  <button 
                    onClick={() => {
                      const newExpanded = new Set(expandedRecos);
                      if (newExpanded.has(app.id)) {
                        newExpanded.delete(app.id);
                      } else {
                        newExpanded.add(app.id);
                      }
                      setExpandedRecos(newExpanded);
                    }}
                    className="flex items-center gap-2 text-[#fcb32c] hover:text-[#ffd966] transition-colors" 
                    data-testid={`button-recommendations-${app.id}`}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedRecos.has(app.id) ? "rotate-180" : ""}`} />
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">{app.recommendations.length} Agronomist Recommendation{app.recommendations.length !== 1 ? "s" : ""}</span>
                  </button>
                  {expandedRecos.has(app.id) && (
                    <div className="mt-3 space-y-2">
                      {app.recommendations.map((rec: any) => (
                        <Card key={rec.id} className="p-3 bg-[#0a2b1f] border-[#093d2b]" data-testid={`recommendation-${rec.id}`}>
                          <div className="flex gap-2 items-start">
                            {rec.priority === "high" ? (
                              <AlertCircle className="w-5 h-5 text-[#ff6b6b] flex-shrink-0 mt-0.5" />
                            ) : rec.priority === "medium" ? (
                              <AlertCircle className="w-5 h-5 text-[#fcb32c] flex-shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-[#51cf66] flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-[#fcb32c]">{rec.agronomer}</span>
                                <Badge variant="outline" className={`text-xs ${rec.priority === "high" ? "text-[#ff6b6b]" : rec.priority === "medium" ? "text-[#fcb32c]" : "text-[#51cf66]"}`}>
                                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No records found matching your criteria</p>
          </Card>
        )}
      </main>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#333] text-[#fcb32c]">
          <DialogHeader>
            <DialogTitle>{exportMode === "all" ? "Export All Records" : "Send Audit Report"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {exportMode === "all" 
                ? `Enter your email address to receive all ${filteredApplications.length} spray application records as a PDF.`
                : "Enter your email address to receive the spray application audit report as a PDF."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="audit-email" className="text-[#fcb32c]">
                Email Address
              </Label>
              <Input
                id="audit-email"
                type="email"
                placeholder="your@email.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="mt-1.5 bg-[#121212db]"
                data-testid="input-audit-email"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending}
                className="flex-1 bg-[#093d2b] text-[#fcb32c]"
                data-testid="button-send-audit-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                {sendEmailMutation.isPending ? "Sending..." : "Send Report"}
              </Button>
              <Button
                onClick={() => setEmailDialogOpen(false)}
                variant="outline"
                className="flex-1"
                data-testid="button-cancel-email"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

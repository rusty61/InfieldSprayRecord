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
import { Search, Download, Eye, Calendar, MapPin, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Records() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFarm, setFilterFarm] = useState("all");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState("");

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
      status: "completed",
    },
    {
      id: "2",
      paddock: "South Block A",
      farm: "Riverside Farm",
      date: "2025-11-21",
      operator: "Sarah Mitchell",
      chemicals: ["2,4-D Amine"],
      area: 8.3,
      status: "completed",
    },
    {
      id: "3",
      paddock: "East Paddock 12",
      farm: "Hillside Farm",
      date: "2025-11-20",
      operator: "John Davis",
      chemicals: ["Triclopyr", "Surfactant"],
      area: 15.2,
      status: "completed",
    },
    {
      id: "4",
      paddock: "West Section 3",
      farm: "Hillside Farm",
      date: "2025-11-19",
      operator: "Sarah Mitchell",
      chemicals: ["Glyphosate 540"],
      area: 6.8,
      status: "completed",
    },
  ];

  const sendEmailMutation = useMutation({
    mutationFn: async ({ appId, email }: { appId: string; email: string }) => {
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
      toast({
        title: "Success",
        description: "Audit report sent to your email successfully.",
      });
      setEmailDialogOpen(false);
      setEmailAddress("");
      setSelectedAppId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send audit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    if (!emailAddress || !selectedAppId) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    sendEmailMutation.mutate({ appId: selectedAppId, email: emailAddress });
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
                const csv = [
                  ["Date", "Farm", "Paddock", "Operator", "Area (ha)", "Water Rate (L/ha)", "Chemicals"].join(","),
                  ...filteredApplications.map(app =>
                    [
                      new Date(app.date).toLocaleDateString("en-AU"),
                      app.farm,
                      app.paddock,
                      app.operator,
                      app.area,
                      app.waterRate,
                      app.chemicals.join("; ")
                    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
                  )
                ].join("\n");
                
                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `spray-records-${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
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
            <DialogTitle>Send Audit Report</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your email address to receive the spray application audit report as a PDF.
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

import { useState } from "react";
import { Link } from "wouter";
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
import { Search, Download, Eye, Calendar, MapPin } from "lucide-react";

export default function Records() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFarm, setFilterFarm] = useState("all");

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

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.paddock.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.operator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFarm = filterFarm === "all" || app.farm === filterFarm;
    return matchesSearch && matchesFarm;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <AppHeader title="Records" />
      <main className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Application Records</h2>
            <p className="text-sm text-muted-foreground">
              View and export spray application history
            </p>
          </div>
          <Link href="/paddocks">
            <Button data-testid="button-new-paddock">
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
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Select value={filterFarm} onValueChange={setFilterFarm}>
              <SelectTrigger className="md:w-[200px]" data-testid="select-farm-filter">
                <SelectValue placeholder="Filter by farm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farms</SelectItem>
                <SelectItem value="Riverside Farm">Riverside Farm</SelectItem>
                <SelectItem value="Hillside Farm">Hillside Farm</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="p-4 md:p-6" data-testid={`record-${app.id}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                      <Badge key={chemical} variant="outline" className="text-xs">
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
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Plus, Pencil, Trash, ExternalLink, BookOpen, FileText, Video, Globe, Code, Tag, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getResources, getMenteeResources, deleteResource } from "@/lib/actions/resources"
import { getCurrentUser } from "@/lib/actions/users"
import type { Resource, User } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define resource types for categorization
type ResourceType = "article" | "video" | "tutorial" | "documentation" | "tool" | "other";

// Get icon based on URL or title keywords
function getResourceIcon(resource: Resource) {
  const url = resource.url.toLowerCase();
  const title = resource.title.toLowerCase();
  
  if (url.includes('youtube') || url.includes('vimeo') || title.includes('video')) {
    return <Video className="h-5 w-5 text-red-500" />;
  } else if (url.includes('github') || title.includes('code') || title.includes('github')) {
    return <Code className="h-5 w-5 text-violet-500" />;
  } else if (url.includes('docs') || title.includes('documentation') || title.includes('reference')) {
    return <FileText className="h-5 w-5 text-blue-500" />;
  } else {
    return <Globe className="h-5 w-5 text-emerald-500" />;
  }
}

// Classify resource type based on URL and title
function getResourceType(resource: Resource): ResourceType {
  const url = resource.url.toLowerCase();
  const title = resource.title.toLowerCase();
  
  if (url.includes('youtube') || url.includes('vimeo') || title.includes('video')) {
    return "video";
  } else if (url.includes('github') || title.includes('tutorial') || title.includes('how to')) {
    return "tutorial";
  } else if (url.includes('docs') || title.includes('documentation') || title.includes('reference')) {
    return "documentation";
  } else if (url.includes('tool') || title.includes('tool') || title.includes('generator')) {
    return "tool";
  } else if (title.includes('article') || url.includes('blog')) {
    return "article";
  } else {
    return "other";
  }
}

// Group resources by type
function groupResourcesByType(resources: Resource[]) {
  const groups: Record<string, Resource[]> = {
    'video': [],
    'article': [],
    'documentation': [],
    'tutorial': [],
    'tool': [],
    'other': []
  };
  
  resources.forEach(resource => {
    const type = getResourceType(resource);
    groups[type].push(resource);
  });
  
  return groups;
}

export default function ResourcesPage() {
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFilter, setCurrentFilter] = useState<string>("all")

  const loadData = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
      
      const data = userData.role === "MENTOR" 
        ? await getResources()
        : await getMenteeResources()
      
      setResources(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resources"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteResource(id)
      setResources(prev => prev.filter(r => r.id !== id))
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource"
      })
    } finally {
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
    }
  }

  // Filter resources based on search and type filter
  const filteredResources = resources.filter(resource => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!resource.title.toLowerCase().includes(query) && 
          !resource.url.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Apply type filter
    if (currentFilter !== "all") {
      return getResourceType(resource) === currentFilter;
    }
    
    return true;
  });
  
  // Group resources by type
  const groupedResources = groupResourcesByType(filteredResources);
  
  // Count resources by type
  const countByType = {
    all: filteredResources.length,
    video: groupedResources.video.length,
    article: groupedResources.article.length,
    documentation: groupedResources.documentation.length,
    tutorial: groupedResources.tutorial.length,
    tool: groupedResources.tool.length,
    other: groupedResources.other.length
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Learning Resources</h1>
          <p className="text-zinc-400 mt-1">
            {user?.role === "MENTOR"
              ? "Manage learning materials for your mentees"
              : "Curated learning resources to help you succeed"}
          </p>
        </div>
        {user?.role === "MENTOR" && (
          <Link href="/dashboard/resources/create">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Add Resource
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setCurrentFilter}>
          <TabsList className="w-full md:w-auto bg-zinc-800 grid grid-cols-3 md:flex">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
              All ({countByType.all})
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-red-600/80 data-[state=active]:text-white flex items-center gap-1">
              <Video className="h-3.5 w-3.5" /> Videos ({countByType.video})
            </TabsTrigger>
            <TabsTrigger value="article" className="data-[state=active]:bg-blue-600/80 data-[state=active]:text-white flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Articles ({countByType.article})
            </TabsTrigger>
            <TabsTrigger value="tutorial" className="data-[state=active]:bg-amber-600/80 data-[state=active]:text-white flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> Tutorials ({countByType.tutorial})
            </TabsTrigger>
            <TabsTrigger value="documentation" className="data-[state=active]:bg-purple-600/80 data-[state=active]:text-white hidden md:flex items-center gap-1">
              <Code className="h-3.5 w-3.5" /> Docs ({countByType.documentation})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[250px] border-zinc-700 bg-zinc-800 placeholder:text-zinc-500"
          />
        </div>
      </div>

      {filteredResources.length > 0 ? (
        <div className="space-y-10">
          {/* Featured section */}
          {currentFilter === "all" && filteredResources.length > 3 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                Featured Resources
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {filteredResources.slice(0, 3).map((resource) => (
                  <Card key={resource.id} className="border-zinc-800 bg-zinc-900/70 backdrop-blur flex flex-col overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 h-2" />
                    <CardContent className="flex flex-col flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-start">
                          <div className="rounded-full p-2 bg-zinc-800/80 mt-0.5">
                            {getResourceIcon(resource)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{resource.title}</h3>
                            <Badge variant="outline" className="mt-1 text-[10px] bg-zinc-800/80 text-zinc-300 border-zinc-700">
                              {getResourceType(resource)}
                            </Badge>
                          </div>
                        </div>
                        {user?.role === "MENTOR" && (
                          <div className="flex">
                            <Link href={`/dashboard/resources/${resource.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 mb-4 flex-1">
                        <p className="text-sm text-zinc-400 break-words">
                          {resource.url.replace(/https?:\/\/(www\.)?/i, '')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                        >
                          Open Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                        
                        {user?.role === "MENTOR" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            onClick={() => {
                              setResourceToDelete(resource.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Display resources by type */}
          {currentFilter === "all" ? (
            // When showing all resources, group them by type
            Object.entries(groupedResources)
              .filter(([_, resources]) => resources.length > 0)
              .map(([type, resources]) => (
                <div key={type}>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    {type === "video" && <Video className="h-5 w-5 text-red-500" />}
                    {type === "article" && <FileText className="h-5 w-5 text-blue-500" />}
                    {type === "documentation" && <Code className="h-5 w-5 text-violet-500" />}
                    {type === "tutorial" && <BookOpen className="h-5 w-5 text-amber-500" />}
                    {type === "tool" && <Globe className="h-5 w-5 text-emerald-500" />}
                    {type === "other" && <Tag className="h-5 w-5 text-zinc-400" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                    <Badge variant="outline" className="ml-2 text-xs bg-zinc-800 text-zinc-300 border-zinc-700">
                      {resources.length}
                    </Badge>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                      <ResourceCard 
                        key={resource.id} 
                        resource={resource} 
                        user={user} 
                        onDelete={() => {
                          setResourceToDelete(resource.id)
                          setDeleteDialogOpen(true)
                        }} 
                      />
                    ))}
                  </div>
                </div>
              ))
          ) : (
            // When filtering by type, show resources in a grid
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  user={user} 
                  onDelete={() => {
                    setResourceToDelete(resource.id)
                    setDeleteDialogOpen(true)
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/70">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No resources found</h3>
              <p className="text-zinc-400 max-w-md">
                {searchQuery 
                  ? "No resources match your search criteria."
                  : user?.role === "MENTOR" 
                    ? "Add your first resource to help your mentees learn!" 
                    : "Your mentor hasn't shared any resources yet."}
              </p>
              
              {user?.role === "MENTOR" && (
                <Link href="/dashboard/resources/create" className="mt-4">
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" /> Add First Resource
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Resource</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. This will permanently delete the resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resourceToDelete && handleDelete(resourceToDelete)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Resource card component
function ResourceCard({ resource, user, onDelete }: { 
  resource: Resource, 
  user: User | null,
  onDelete: () => void
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur flex flex-col overflow-hidden h-full">
      <CardContent className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <div className="rounded-full p-2 bg-zinc-800/80">
              {getResourceIcon(resource)}
            </div>
            <h3 className="font-semibold text-white">{resource.title}</h3>
          </div>
          {user?.role === "MENTOR" && (
            <Link href={`/dashboard/resources/${resource.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        
        <div className="mt-3 flex-1">
          <p className="text-sm text-zinc-400 break-words">
            {resource.url.replace(/https?:\/\/(www\.)?/i, '')}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
          <Badge variant="outline" className="text-[10px] bg-zinc-800/80 text-zinc-300 border-zinc-700">
            {getResourceType(resource)}
          </Badge>
          
          <div className="flex gap-2">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
            >
              Visit <ExternalLink className="h-3.5 w-3.5" />
            </a>
            
            {user?.role === "MENTOR" && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                onClick={onDelete}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

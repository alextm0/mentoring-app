"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CodeDisplayProps {
  code: string
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  const { toast } = useToast()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to clipboard",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy code to clipboard",
      })
    }
  }

  return (
    <div className="relative">
      <div className="absolute right-2 top-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm whitespace-pre-wrap">{code}</pre>
    </div>
  )
}

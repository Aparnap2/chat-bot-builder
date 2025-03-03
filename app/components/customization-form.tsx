"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ChatSettings } from "@/types/types"
import { Trash2, Plus } from 'lucide-react'

interface CustomizationFormProps {
  settings: ChatSettings
  updateSettings: (settings: Partial<ChatSettings>) => void
}

export function CustomizationForm({ settings, updateSettings }: CustomizationFormProps) {
  const [file, setFile] = useState<File | null>(null)
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith('image/') && selectedFile.size < 5 * 1024 * 1024) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        updateSettings({ customLogo: reader.result as string })
      }
      reader.readAsDataURL(selectedFile)
    } else if (selectedFile) {
      alert('Please upload an image file under 5MB.')
    }
  }

  const addQuickReply = () => {
    updateSettings({
      quickReplies: [...settings.quickReplies, { text: '', action: '' }]
    })
  }

  const removeQuickReply = (index: number) => {
    updateSettings({
      quickReplies: settings.quickReplies.filter((_, i) => i !== index)
    })
  }

  const updateQuickReply = (index: number, field: 'text' | 'action', value: string) => {
    const newReplies = [...settings.quickReplies]
    newReplies[index] = { ...newReplies[index], [field]: value }
    updateSettings({ quickReplies: newReplies })
  }

  const handleDocumentUpload = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would upload the document to your backend
    alert('Document upload functionality would be implemented here')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <div>
            <Label htmlFor="chatbotName">Chatbot Name</Label>
            <Input
              id="chatbotName"
              value={settings.chatbotName}
              onChange={(e) => updateSettings({ chatbotName: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brandColor">Brand Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="brandColor"
                  type="color"
                  value={settings.brandColor}
                  onChange={(e) => updateSettings({ brandColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.brandColor}
                  onChange={(e) => updateSettings({ brandColor: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="chatBackground">Chat Background</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="chatBackground"
                  type="color"
                  value={settings.chatBackground}
                  onChange={(e) => updateSettings({ chatBackground: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.chatBackground}
                  onChange={(e) => updateSettings({ chatBackground: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="userBubbleColor">User Bubble Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="userBubbleColor"
                  type="color"
                  value={settings.userBubbleColor}
                  onChange={(e) => updateSettings({ userBubbleColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.userBubbleColor}
                  onChange={(e) => updateSettings({ userBubbleColor: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="aiBubbleColor">AI Bubble Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="aiBubbleColor"
                  type="color"
                  value={settings.aiBubbleColor}
                  onChange={(e) => updateSettings({ aiBubbleColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.aiBubbleColor}
                  onChange={(e) => updateSettings({ aiBubbleColor: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="headingColor">Heading Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="headingColor"
                  type="color"
                  value={settings.headingColor}
                  onChange={(e) => updateSettings({ headingColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.headingColor}
                  onChange={(e) => updateSettings({ headingColor: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="logo">Custom Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="bg-gray-700 border-gray-600"
            />
            {settings.customLogo && (
              <div className="mt-2">
                <img src={settings.customLogo || "/placeholder.svg"} alt="Logo" className="w-16 h-16 object-contain rounded" />
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mt-1"
                  onClick={() => updateSettings({ customLogo: null })}
                >
                  Remove Logo
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="dimensions" className="bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <div>
            <Label htmlFor="chatWidth">Width (px): {settings.chatWidth}</Label>
            <Slider
              id="chatWidth"
              min={300}
              max={800}
              step={10}
              value={[settings.chatWidth]}
              onValueChange={(value) => updateSettings({ chatWidth: value[0] })}
              className="my-4"
            />
          </div>
          
          <div>
            <Label htmlFor="chatHeight">Height (px): {settings.chatHeight}</Label>
            <Slider
              id="chatHeight"
              min={400}
              max={1000}
              step={10}
              value={[settings.chatHeight]}
              onValueChange={(value) => updateSettings({ chatHeight: value[0] })}
              className="my-4"
            />
          </div>
          
          <div>
            <Label htmlFor="chatBorderRadius">Border Radius (px): {settings.chatBorderRadius}</Label>
            <Slider
              id="chatBorderRadius"
              min={0}
              max={50}
              step={1}
              value={[settings.chatBorderRadius]}
              onValueChange={(value) => updateSettings({ chatBorderRadius: value[0] })}
              className="my-4"
            />
          </div>
          
          <div>
            <Label htmlFor="chatOpacity">Opacity: {settings.chatOpacity.toFixed(1)}</Label>
            <Slider
              id="chatOpacity"
              min={0.1}
              max={1}
              step={0.1}
              value={[settings.chatOpacity]}
              onValueChange={(value) => updateSettings({ chatOpacity: value[0] })}
              className="my-4"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chatOffsetX">X Offset (px)</Label>
              <Input
                id="chatOffsetX"
                type="number"
                value={settings.chatOffsetX}
                onChange={(e) => updateSettings({ chatOffsetX: Number(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="chatOffsetY">Y Offset (px)</Label>
              <Input
                id="chatOffsetY"
                type="number"
                value={settings.chatOffsetY}
                onChange={(e) => updateSettings({ chatOffsetY: Number(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="showEmailCapture"
              checked={settings.showEmailCapture}
              onCheckedChange={(checked) => updateSettings({ showEmailCapture: checked })}
            />
            <Label htmlFor="showEmailCapture">Show Email Capture</Label>
          </div>
          
          {settings.showEmailCapture && (
            <div>
              <Label htmlFor="emailPlaceholder">Email Placeholder</Label>
              <Input
                id="emailPlaceholder"
                value={settings.emailPlaceholder}
                onChange={(e) => updateSettings({ emailPlaceholder: e.target.value })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          )}
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Quick Replies</Label>
              <Button size="sm" variant="outline" onClick={addQuickReply}>
                <Plus className="h-4 w-4 mr-1" /> Add Reply
              </Button>
            </div>
            
            {settings.quickReplies.map((reply, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={reply.text}
                  onChange={(e) => updateQuickReply(index, 'text', e.target.value)}
                  placeholder="Text"
                  className="bg-gray-700 border-gray-600 flex-1"
                />
                <Input
                  value={reply.action}
                  onChange={(e) => updateQuickReply(index, 'action', e.target.value)}
                  placeholder="Action"
                  className="bg-gray-700 border-gray-600 w-1/3"
                />
                <Button variant="destructive" size="icon" onClick={() => removeQuickReply(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="data" className="bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <form onSubmit={handleDocumentUpload}>
            <div>
              <Label htmlFor="document">Upload Document (PDF)</Label>
              <Input
                id="document"
                type="file"
                accept=".pdf"
                className="bg-gray-700 border-gray-600 mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Upload documents to train your chatbot. Only PDFs under 10MB are allowed.
              </p>
            </div>
            
            <Button type="submit" className="mt-4">
              Upload Document
            </Button>
          </form>
          
          <div className="mt-4">
            <Label htmlFor="staticResponses">Static Responses</Label>
            <textarea
              id="staticResponses"
              rows={5}
              placeholder="Add static responses for your chatbot, one per line. Format: question=answer"
              className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            ></textarea>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Switch id="enableRag" />
            <Label htmlFor="enableRag">Enable RAG (Retrieval Augmented Generation)</Label>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <Button className="w-full">Save Changes</Button>
      </div>
    </div>
  )
}

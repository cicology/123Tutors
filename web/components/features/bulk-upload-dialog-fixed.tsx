"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from "lucide-react"

interface BulkUploadProps {
  onUploadComplete?: () => void
  onClose?: () => void
}

export function BulkUploadDialog({ onUploadComplete, onClose }: BulkUploadProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    console.log('Opening bulk upload dialog...')
    setIsOpen(true)
  }

  const handleClose = () => {
    console.log('Closing bulk upload dialog...')
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }

  const handleTestUpload = () => {
    console.log('Test upload clicked!')
    if (onUploadComplete) {
      onUploadComplete()
    }
    handleClose()
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-1 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4 min-h-[44px] sm:min-h-[40px] border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
        onClick={handleOpen}
      >
        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
        Bulk Upload Students
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Bulk Upload Students</DialogTitle>
            <DialogDescription className="text-sm">
              Upload multiple students at once using a CSV/Excel file or add them manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div className="text-center p-4 sm:p-8">
              <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Bulk Upload Feature</h3>
              <p className="text-sm text-gray-600 mb-4">
                This feature allows you to upload multiple students at once.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Button onClick={handleClose} variant="outline" className="text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4">
                  Close
                </Button>
                <Button 
                  onClick={handleTestUpload}
                  className="bg-[#FF0090] hover:bg-[#E6007A] text-white text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4"
                >
                  Test Upload
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

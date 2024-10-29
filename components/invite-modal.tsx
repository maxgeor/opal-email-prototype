'use client'

import { X, Minus, HelpCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import NumberFlow from '@number-flow/react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@radix-ui/react-tooltip"

interface InvitedUser {
  email: string
  status: 'INVITED' | 'JOINED'
}

interface EmailField {
  id: string
  value: string
}

export function InviteModal({ open = true, onOpenChange = () => {} }: { 
  open?: boolean
  onOpenChange?: (open: boolean) => void 
}) {
  const [emailFields, setEmailFields] = useState<EmailField[]>([
    { id: '1', value: '' }
  ])
  const [invitedUsers] = useState<InvitedUser[]>([
    { email: 'bill@opal.co', status: 'INVITED' },
    { email: 'bill@opal.co', status: 'INVITED' },
    { email: 'bill@opal.co', status: 'JOINED' },
    { email: 'bill@opal.co', status: 'JOINED' },
    { email: 'bill@opal.co', status: 'JOINED' },
  ])
  const [isScrolled, setIsScrolled] = useState(false)
  const [modalHeight, setModalHeight] = useState<number | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setIsScrolled(scrollTop > 0)
    scrollPositionRef.current = scrollTop
  }

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight + 200
      setModalHeight(Math.min(height, 700))
    }
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPositionRef.current
    }
  }, [emailFields])

  const handleEmailChange = (id: string, value: string) => {
    setEmailFields(prevFields => {
      if (!prevFields) return [{ id: '1', value: '' }]
      
      const newFields = prevFields.map(field =>
        field.id === id ? { ...field, value } : field
      )
      
      const index = newFields.findIndex(field => field.id === id)
      if (index === newFields.length - 1 && value.length === 1) {
        return [...newFields, { id: crypto.randomUUID(), value: '' }]
      }
      
      return newFields
    })
  }

  const handleEmailBlur = (id: string) => {
    setEmailFields(prevFields => {
      if (!prevFields) return [{ id: '1', value: '' }]
      
      const index = prevFields.findIndex(field => field.id === id)
      if (index === -1) return prevFields
      
      const field = prevFields[index]
      if (!field.value && index !== prevFields.length - 1) {
        return prevFields.filter(f => f.id !== id)
      }
      
      return prevFields
    })
  }

  const removeEmail = (id: string) => {
    setEmailFields(prevFields => {
      if (!prevFields) return [{ id: '1', value: '' }]
      
      const newFields = prevFields.filter(field => field.id !== id)
      if (newFields.length === 0) {
        return [{ id: crypto.randomUUID(), value: '' }]
      }
      return newFields
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    const fields = emailFields || []
    const index = fields.findIndex(field => field.id === id)
    if (index === -1) return
    
    const field = fields[index]
    if (index === fields.length - 1 && !field.value) return
    
    if ((e.key === 'Enter' || e.key === 'Backspace') && !field.value) {
      e.preventDefault()
      removeEmail(id)
      
      const prevInput = inputRefs.current[index - 1]
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  const basePrice = 25
  const pricePerCollaborator = 10
  const newCollaboratorCount = (emailFields || []).filter(field => field.value).length
  const existingCollaboratorCount = (invitedUsers || []).length
  const totalCollaborators = newCollaboratorCount + existingCollaboratorCount
  const totalPrice = basePrice + (totalCollaborators * pricePerCollaborator)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="flex flex-col gap-0 bg-black border-[#232329] max-w-[calc(100vw-32px)] sm:max-w-[400px] transition-all duration-200 max-h-[calc(100vh-64px)] md:max-h-[calc(100vh-128px)] md:min-h-[calc(100vh-128px)] p-0"
        style={{ height: modalHeight ? `${modalHeight}px` : "auto" }}
      >
        <AlertDialogHeader
          className={cn(
            "flex-none border-b border-transparent z-10 transition-[border] ease-in-out duration-200 py-6 pl-8 pr-6 rounded-t-[4px]",
            isScrolled && " border-[#232329]"
          )}
        >
          <div className="flex justify-between items-center">
            <AlertDialogTitle className="text-[20px] leading-7 text-white font-medium">
              Invite Collaborators
            </AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-transparent "
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDialogHeader>

        <div
          ref={contentRef}
          onScroll={handleScroll}
          className=" gap-6 flex-1 overflow-y-auto min-h-0 "
        >
          <div className="border border-[#232329] rounded-[4px] overflow-hidden mx-4">
            <AnimatePresence initial={false}>
              {(emailFields || []).map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.2, ease: "easeOut" },
                      opacity: { duration: 0.15, ease: "easeOut" },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0 },
                      opacity: { duration: 0 },
                    },
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className={`relative group focus-within:bg-[#191B1C] focus-within:z-10 ${
                      index !== (emailFields || []).length - 1
                        ? "border-b border-[#232329]"
                        : ""
                    }`}
                  >
                    <div className="absolute inset-0 transition-colors" />
                    <div className="relative flex items-center">
                      <Input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="email"
                        value={field.value}
                        onChange={(e) =>
                          handleEmailChange(field.id, e.target.value)
                        }
                        onBlur={() => handleEmailBlur(field.id)}
                        onKeyDown={(e) => handleKeyDown(e, field.id)}
                        placeholder="Add an email..."
                        className="bg-transparent border-0 rounded-none text-white placeholder:text-gray-500 focus:ring-2 focus:ring-gray-700 focus:ring-offset-0 ring-offset-0 px-4 py-3"
                      />
                      {field.value && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEmail(field.id)}
                          className="absolute right-2 text-gray-400 hover:text-white hover:bg-transparent"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-col px-8 py-7">
            {(invitedUsers || []).map((user, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-1.5 first:pt-0 last:pb-0 border-b border-[#191B1C] last:border-b-0"
              >
                <span className="text-gray-300">{user.email}</span>
                <span className="text-gray-500 text-[10px] tracking-[0.1em]">
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-none border-t border-[#232329] rounded-t-md">
          <div className="py-4 space-y-2">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center justify-between gap-2 w-full mx-8 ">
                <h3 className="text-xs font-medium text-gray-400 tracking-[0.1em] uppercase">
                  {emailFields.length === 1 ? "YOUR Current PLAN" : "YOUR NEW PLAN"}
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white -mr-2"
                      >
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Base price: ${basePrice}/mo + ${pricePerCollaborator}
                        /collaborator
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex justify-between items-center px-8">
              <div className="text-2xl text-white font-variant-numeric-tabular">
                $
                <NumberFlow
                  value={totalPrice}
                  transformTiming={{ duration: 400, easing: "ease-out" }}
                  continuous={true}
                  trend={true}
                />
                /mo
              </div>
              <div className="text-gray-400 text-sm">
                <NumberFlow
                  value={totalCollaborators}
                  transformTiming={{ duration: 400, easing: "ease-out" }}
                  continuous={true}
                  trend={true}
                />{" "}
                collaborators
              </div>
            </div>
          </div>

          <AlertDialogFooter className="sm:justify-between mx-8 pb-6 ">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-transparent px-0"
            >
              Cancel
            </Button>
            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white h-10 px-4 rounded-[2px]">
              Send invites
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
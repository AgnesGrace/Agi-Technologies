import { Section } from "@/state/api.types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"

import { ChevronRight, FileText } from "lucide-react"

interface ISectionsAccordion {
  sections: Section[]
}

export default function SectionsAccordion({ sections }: ISectionsAccordion) {
  return (
    <Accordion multiple className="mt-4 space-y-3">
      {sections.map((section, index) => (
        <AccordionItem
          key={index}
          value={section.title}
          className="overflow-hidden rounded-xl border bg-background shadow-sm"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">
                    {section.title}
                  </p>
                </div>
              </div>

              <span className="text-sm text-muted-foreground">
                {section.lectures.length} lectures
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="border-t bg-muted/30 p-4">
            <ul className="space-y-2">
              {section.lectures.map((lecture) => (
                <li
                  key={lecture.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>

                    <span className="text-sm">{lecture.title}</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

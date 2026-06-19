"use client";

import { ChevronDownIcon, XIcon } from "@zenncore/icons";
import { useDebounceCallback } from "@zenncore/utils/hooks";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@zenncore/web/components/accordion";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@zenncore/web/components/alert-dialog";
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePositioner,
} from "@zenncore/web/components/autocomplete";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@zenncore/web/components/avatar";
import {
  Button,
  type ButtonColor,
  type ButtonVariant,
} from "@zenncore/web/components/button";
import { Checkbox } from "@zenncore/web/components/checkbox";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@zenncore/web/components/collapsible";
import {
  Combobox,
  ComboboxClear,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxPositioner,
  ComboboxTrigger,
} from "@zenncore/web/components/combobox";
import {
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@zenncore/web/components/dialog";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@zenncore/web/components/number-field";
import {
  PhoneField,
  PhoneFieldCountryCombobox,
  PhoneFieldInput,
} from "@zenncore/web/components/phone-field";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverPopup,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
} from "@zenncore/web/components/popover";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@zenncore/web/components/progress";
import { Radio, RadioGroup } from "@zenncore/web/components/radio";
import { ScrollArea } from "@zenncore/web/components/scroll-area";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@zenncore/web/components/select";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@zenncore/web/components/sheet";
import { Slider } from "@zenncore/web/components/slider";
import { Switch } from "@zenncore/web/components/switch";
import {
  TextField,
  TextFieldInput,
  TextFieldMaskToggle,
} from "@zenncore/web/components/text-field";
import { Toggle } from "@zenncore/web/components/toggle";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState } from "react";

const BUTTON_VARIANTS = [
  "default",
  "soft",
  "outline",
  "ghost",
  "flat",
] as const satisfies ButtonVariant[];
const BUTTON_COLORS = [
  "primary",
  "secondary",
  "neutral",
  "info",
  "error",
  "warning",
  "emphasis",
  "accent",
] as const satisfies ButtonColor[];

export default () => {
  const { theme, setTheme } = useTheme();
  const debouncedFn = (x: number, callback?: (result: number) => void) => {
    const result = x * 2;
    callback?.(result);
  };
  const [state, setState] = useState<string>("");
  const [open, setOpen] = useState(false);

  const debounce = useDebounceCallback(debouncedFn, 1000);

  debounce(3, (result) => {
    console.log("Debounced Result:", result);
  });

  return (
    <main className="mx-auto w-fit space-y-12 py-20">
      <button
        type="button"
        className="text-chart-5"
        onClick={() => {
          if (theme === "light") setTheme("dark");
          else setTheme("light");
        }}
      >
        Change Theme <span className="dark:hidden">(Light)</span>
        <span className="hidden dark:inline">(Dark)</span>
      </button>
      <h1 className="text-center font-bold text-5xl text-background">
        zenncore
      </h1>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Autocomplete</h3>
        <Autocomplete items={tags}>
          <label
            htmlFor="autocomplete-input"
            className="flex flex-col gap-1 font-medium text-text-sm leading-5"
          >
            Search tags
            <AutocompleteInput
              id="autocomplete-input"
              placeholder="e.g. feature"
            />
          </label>

          <AutocompletePositioner>
            <AutocompletePopup>
              <AutocompleteEmpty>No tags found.</AutocompleteEmpty>
              <AutocompleteList>
                {(tag: Tag) => (
                  <AutocompleteItem key={tag.id} value={tag}>
                    {tag.value}
                  </AutocompleteItem>
                )}
              </AutocompleteList>
            </AutocompletePopup>
          </AutocompletePositioner>
        </Autocomplete>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Accordion</h3>
        <Accordion>
          <AccordionItem className="border-gray-200">
            <AccordionTrigger>What is zenncore?</AccordionTrigger>
            <AccordionPanel>
              <div className="pb-3">
                zenncore is a modern React UI library that provides accessible
                components with built-in Tailwind CSS support.
              </div>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem className="border-gray-200">
            <AccordionTrigger>What components are included?</AccordionTrigger>
            <AccordionPanel>
              <div className="pb-3">
                zenncore includes essential UI components like Accordion,
                Button, Form elements, and more. All components are fully
                customizable and follow WAI-ARIA guidelines.
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem className="border-gray-200">
            <AccordionTrigger>Is it production ready?</AccordionTrigger>
            <AccordionPanel>
              <div className="pb-3">
                Yes! zenncore is thoroughly tested, TypeScript-first, and
                optimized for production use. It's perfect for both small
                projects and large-scale applications.
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Alert Dialog</h3>
        <AlertDialog>
          <AlertDialogTrigger>Hello</AlertDialogTrigger>
          <AlertDialogPopup>
            <AlertDialogTitle>Alert Dialog</AlertDialogTitle>
            <AlertDialogDescription>
              This is an alert description.
            </AlertDialogDescription>
            <AlertDialogClose className="ml-auto">Close</AlertDialogClose>
          </AlertDialogPopup>
        </AlertDialog>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Avatar</h3>
        <Avatar className="bg-black p-2.5">
          <AvatarImage
            src="/vercel.svg"
            className="-translate-y-0.5 object-contain"
            render={<Image src="/vercel.svg" alt="Avatar Image" />}
          />
          <AvatarFallback className="text-white">CN</AvatarFallback>
        </Avatar>
      </section>
      <section className="flex flex-col gap-4 rounded-2xl px-8 py-6">
        <h3 className="font-bold text-2xl">Button</h3>
        {BUTTON_VARIANTS.map((variant) => (
          <div key={variant} className="flex items-center gap-1">
            {BUTTON_COLORS.map((color) => (
              <Button
                key={`${variant}/${color}`}
                variant={variant}
                color={color}
              >{`${variant}/${color}`}</Button>
            ))}
          </div>
        ))}
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Checkbox</h3>
        <label htmlFor="terms" className="flex items-center gap-1.5">
          <Checkbox defaultChecked id="terms" />
          Accept <b>zennit</b> as the best Company
        </label>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Collapsible</h3>
        <Collapsible className="h-35">
          <CollapsibleTrigger
            render={<Button color="accent" />}
            className="group flex items-center gap-2 border border-gray-200"
          >
            <ChevronDownIcon
              className={
                "size-3 -rotate-90 transition-transform ease-out group-data-panel-open:rotate-0"
              }
            />
            zenncore features
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-background p-2">
              <p className="text-sm">1.cutting-edge design system</p>
              <p className="text-sm">2.built-in Tailwind CSS support</p>
              <p className="text-sm">3.customizable components</p>
            </div>
          </CollapsiblePanel>
        </Collapsible>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Combobox</h3>
        <Combobox items={fruits}>
          <div className="relative flex flex-col gap-1 font-medium text-gray-900 text-sm leading-5">
            <label htmlFor="combobox-input">Choose a fruit</label>
            <ComboboxInput placeholder="e.g. Apple" id="combobox-input" />
            <div className="absolute right-2 bottom-0 flex h-10 items-center justify-center text-gray-600">
              <ComboboxClear aria-label="Clear selection">
                <XIcon className="size-4" />
              </ComboboxClear>
              <ComboboxTrigger aria-label="Open popup">
                <ChevronDownIcon className="size-4" />
              </ComboboxTrigger>
            </div>
          </div>

          <ComboboxPositioner>
            <ComboboxPopup>
              <ComboboxEmpty>No fruits found.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    <div className="col-start-2">{item}</div>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxPopup>
          </ComboboxPositioner>
        </Combobox>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Dialog</h3>
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          toogle dialog
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>Hello</DialogTrigger>
          <DialogPopup>
            <DialogTitle>Alert Dialog</DialogTitle>
            <DialogDescription>This is an alert description.</DialogDescription>
            <AlertDialogClose className="ml-auto">Close</AlertDialogClose>
          </DialogPopup>
        </Dialog>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Text Field</h3>
        <TextField
          type="password"
          onMaskChange={(masked) => {
            console.log("Masked Changed:", masked);
          }}
        >
          {/* <EyeIcon /> */}
          <TextFieldInput className="text-white data-masked:text-red-600" />
          <TextFieldMaskToggle
            // render={({ color, ...props }, state) => {
            //   return (
            //     <Button {...props}>{state.visible ? "Visible" : "Hidden"</Button>
            //   );
            // }}
            // classList={{
            //   icon: "group-data-hidden:text-red-500",
            // }}
            // render={(props, state) => {
            //   return (
            //     <button type="button" {...props}>
            //       {state.masked ? "Visible" : "Hidden"
            //     </button>
            //   );
            // }}
            className="group text-white aria-pressed:bg-red-500 data-masked:text-yellow-500"
          >
            {/* <p className="group-data-masked:hidden">Visible</p>
          <p className="hidden group-data-masked:block">Hidden</p> */}
          </TextFieldMaskToggle>
        </TextField>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Text Field</h3>
        <PhoneField defaultCountry="US" defaultValue="661234567">
          <PhoneFieldCountryCombobox />
          <PhoneFieldInput
            render={(props) => {
              console.log(props.value);
              return <input {...props} />;
            }}
          />
        </PhoneField>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Number Field</h3>
        <NumberField
          defaultValue={999}
          onValueChange={(value) => {
            console.log("Number Field Value Changed:", value);
          }}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Popover</h3>
        <Popover>
          <PopoverTrigger className="w-fit">zenncore</PopoverTrigger>
          <PopoverPositioner>
            <PopoverPopup className="max-w-65">
              <PopoverArrow />
              <PopoverTitle className="text-center">
                zenncore Popup
              </PopoverTitle>
              <PopoverDescription>
                This is a popover description
              </PopoverDescription>
            </PopoverPopup>
          </PopoverPositioner>
        </Popover>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Progress</h3>
        <Progress value={6} className="space-y-2">
          <div className="flex justify-between">
            <ProgressLabel>zenncore progress</ProgressLabel>
            <ProgressValue />
          </div>
        </Progress>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Radio Group</h3>
        <RadioGroup defaultValue="option1" className="flex flex-col gap-2">
          <label htmlFor="zenncore" className="flex items-center gap-2">
            <Radio value="zenncore" id="zenncore" />
            zenncore
          </label>
          <label htmlFor="zennui" className="flex items-center gap-2">
            <Radio value="zennui" id="zennui" />
            zennui
          </label>
        </RadioGroup>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Scroll Area</h3>
        <ScrollArea
          className="h-32"
          classList={{
            viewport: "py-1 pr-4 pl-2",
            scrollBar: {
              thumb: "bg-primary",
            },
          }}
        >
          zenncore is a comprehensive, modern React UI ecosystem developed by
          Zennit that provides a complete solution for building cross-platform
          applications with exceptional developer experience and
          production-ready components. At its core, zenncore represents a
          paradigm shift in how developers approach UI development, offering a
          monorepo-based architecture that seamlessly bridges web and mobile
          development through a shared component library system. The foundation
          of zenncore lies in its sophisticated monorepo structure, powered by
          Turbo and Bun, which orchestrates multiple interconnected packages and
          applications. This architecture enables developers to maintain
          consistency across different platforms while leveraging the latest in
          build tooling and dependency management. The ecosystem comprises two
          primary application targets: a Next.js-based web application utilizing
          Turbo for enhanced development and build performance, and a React
          Native mobile application designed for cross-platform mobile
          deployment. What sets zenncore apart is its innovative CSS-first
          approach to component design, particularly evident in its charting
          library. This library automatically handles responsive behavior
          through ResizeObserver and CSS custom properties, ensuring that charts
          adapt seamlessly to container size changes without requiring
          JavaScript re-renders, resulting in superior performance and user
          experience. The component ecosystem extends far beyond charting,
          encompassing a comprehensive suite of UI primitives including form
          handling, data tables, icon systems, phone number utilities, and web
          components. Each package is meticulously crafted with TypeScript-first
          development principles, ensuring type safety throughout the entire
          development process. The @zenncore/form package integrates seamlessly
          with React Hook Form and Zod validation, providing developers with
          robust form handling capabilities, while the @zenncore/data-table
          package leverages TanStack Table for powerful data manipulation and
          presentation features.
        </ScrollArea>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Select</h3>
        <Select
        // SSR
        //  items={[
        //.    { value:null, label: "Select an item" },
        //     { value: "item-1", label: "Item 1" },
        //     { value: "item-2", label: "Item 2" },
        //     { value: "item-3", label: "Item 3" },
        //     { value: "item-4", label: "Item 4" },
        //   ]}
        >
          <SelectTrigger>
            <SelectValue className="first-letter:capitalize">
              {(value: string | null) =>
                value?.split("-").join(" ") ?? "Select an item"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectPositioner>
            <SelectPopup>
              <SelectItem value="item-1">Item 1</SelectItem>
              <SelectItem value="item-2">Item 2</SelectItem>
              <SelectItem value="item-3">Item 3</SelectItem>
              <SelectItem value="item-4">Item 4</SelectItem>
            </SelectPopup>
          </SelectPositioner>
        </Select>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Sheet</h3>
        <Sheet>
          <SheetTrigger
            render={({ color, ...props }) => (
              <Button {...props}>Open Sheet</Button>
            )}
          />
          <SheetPopup
            classList={{
              close: {
                icon: "size-7 text-white",
              },
            }}
          >
            <SheetHeader className="pt-20">
              <SheetTitle className="text-white">Submit Feedback</SheetTitle>
              <SheetDescription className="text-white/70">
                Please share your feedback with us to help improve our service.
              </SheetDescription>
            </SheetHeader>

            <SheetFooter>
              <SheetClose
                render={({ color, ...props }) => (
                  <Button {...props} variant="ghost">
                    Close Sheet
                  </Button>
                )}
              />
            </SheetFooter>
          </SheetPopup>
        </Sheet>
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Slider</h3>
        <Slider defaultValue={30} />
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Switch</h3>
        <Switch />
      </section>
      <section className="flex max-w-120 flex-col gap-4 rounded-2xl bg-background-dimmed px-8 py-6">
        <h3 className="font-bold text-2xl">Toggle</h3>
        <div className="flex w-fit gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5">
          <Toggle
            render={(props, state) => {
              return (
                <button {...props}>
                  {state.pressed ? "Pressed" : "Not Pressed"}
                </button>
              );
            }}
            className="w-fit whitespace-nowrap"
          />
        </div>
      </section>
    </main>
  );
};

type Tag = {
  id: string;
  value: string;
};

const tags: Tag[] = [
  { id: "t1", value: "feature" },
  { id: "t2", value: "fix" },
  { id: "t3", value: "bug" },
  { id: "t4", value: "docs" },
  { id: "t5", value: "internal" },
  { id: "t6", value: "mobile" },
  { id: "c-accordion", value: "component: accordion" },
  { id: "c-alert-dialog", value: "component: alert dialog" },
  { id: "c-autocomplete", value: "component: autocomplete" },
  { id: "c-avatar", value: "component: avatar" },
  { id: "c-checkbox", value: "component: checkbox" },
  { id: "c-checkbox-group", value: "component: checkbox group" },
  { id: "c-collapsible", value: "component: collapsible" },
  { id: "c-combobox", value: "component: combobox" },
  { id: "c-context-menu", value: "component: context menu" },
  { id: "c-dialog", value: "component: dialog" },
  { id: "c-field", value: "component: field" },
  { id: "c-fieldset", value: "component: fieldset" },
  { id: "c-filterable-menu", value: "component: filterable menu" },
  { id: "c-form", value: "component: form" },
  { id: "c-input", value: "component: input" },
  { id: "c-menu", value: "component: menu" },
  { id: "c-menubar", value: "component: menubar" },
  { id: "c-meter", value: "component: meter" },
  { id: "c-navigation-menu", value: "component: navigation menu" },
  { id: "c-number-field", value: "component: number field" },
  { id: "c-popover", value: "component: popover" },
  { id: "c-preview-card", value: "component: preview card" },
  { id: "c-progress", value: "component: progress" },
  { id: "c-radio", value: "component: radio" },
  { id: "c-scroll-area", value: "component: scroll area" },
  { id: "c-select", value: "component: select" },
  { id: "c-separator", value: "component: separator" },
  { id: "c-slider", value: "component: slider" },
  { id: "c-switch", value: "component: switch" },
  { id: "c-tabs", value: "component: tabs" },
  { id: "c-toast", value: "component: toast" },
  { id: "c-toggle", value: "component: toggle" },
  { id: "c-toggle-group", value: "component: toggle group" },
  { id: "c-toolbar", value: "component: toolbar" },
  { id: "c-tooltip", value: "component: tooltip" },
];

const fruits = [
  "Apple",
  "Banana",
  "Orange",
  "Pineapple",
  "Grape",
  "Mango",
  "Strawberry",
  "Blueberry",
  "Raspberry",
  "Blackberry",
  "Cherry",
  "Peach",
  "Pear",
  "Plum",
  "Kiwi",
  "Watermelon",
  "Cantaloupe",
  "Honeydew",
  "Papaya",
  "Guava",
  "Lychee",
  "Pomegranate",
  "Apricot",
  "Grapefruit",
  "Coconut",
];

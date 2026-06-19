"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@zenncore/web/components/button";
import { Fieldset, FieldsetLegend } from "@zenncore/web/components/fieldset";
import {
  Field,
  FieldController,
  FieldError,
  FieldLabel,
  Form,
} from "@zenncore/web/components/form";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@zenncore/web/components/number-field";
// import { Radio, RadioGroup } from "@zenncore/web/components/radio";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@zenncore/web/components/select";
import { Slider } from "@zenncore/web/components/slider";
import { Switch } from "@zenncore/web/components/switch";
import {
  TextField,
  TextFieldInput,
  TextFieldMaskToggle,
} from "@zenncore/web/components/text-field";
import { useForm } from "react-hook-form";
import * as z from "zod";

const ANIMALS = ["dog", "cat", "fish"] as const;

const schema = z.object({
  name: z.string().min(10),
  employed: z.boolean().refine((val) => !!val),
  favoriteAnimal: z.enum(ANIMALS),
  age: z.tuple([z.number().min(40), z.number().min(80)]),
  salary: z.coerce.number<number>().min(10),
});

// async function submitForm(event: React.FormEvent<HTMLFormElement>) {
//   event.preventDefault();

//   const formData = new FormData(event.currentTarget);
//   const result = schema.safeParse(Object.fromEntries(formData as any));

//   if (!result.success) {
//     const formErrors = z.treeifyError(result.error).properties;

//     if (!formErrors) {
//       return {
//         errors: {},
//       };
//     }

//     const flattenedErrors = Object.entries(formErrors).reduce(
//       (acc, [key, value]) => {
//         acc[key] = value.errors;
//         return acc;
//       },
//       {} as Record<string, string[]>,
//     );

//     return {
//       errors: flattenedErrors,
//     };
//   }

//   return {
//     errors: {},
//   };
// }

// export default function Page() {
//   const [errors, setErrors] = React.useState({});

//   return (
//     <Form
//       className="flex w-full max-w-64 flex-col gap-4"
//       errors={errors}
//       onClearErrors={setErrors}
//       onSubmit={async (event) => {
//         const response = await submitForm(event);
//         setErrors(response.errors);
//       }}
//     >
//       <Field.Root name="name" className="flex flex-col items-start gap-1">
//         <Field.Label className="text-sm data-invalid:bg-red-500 font-medium text-gray-900">
//           Name
//         </Field.Label>
//         <Field.Control
//           placeholder="Enter name"
//           className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
//         />
//         <Field.Error className="text-sm text-red-800" />
//       </Field.Root>
//       <Field.Root name="age" className="flex flex-col items-start gap-1">
//         <Field.Label className="text-sm font-medium text-gray-900">
//           Age
//         </Field.Label>
//         <Field.Control
//           placeholder="Enter age"
//           className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
//         />
//         <Field.Error className="text-sm text-red-800" />
//       </Field.Root>
//       <button
//         type="submit"
//         className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
//       >
//         Submit
//       </button>
//     </Form>
//   );
// }

export default function Page() {
  "use no memo";
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      employed: false,
      age: [0, 100],
      salary: 0,
      favoriteAnimal: "dog",
    },
  });

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit((data) => {
        console.log("Form submitted:", data);
      })}
      className="mx-auto w-1/3 pt-8"
    >
      <FieldController
        name="name"
        control={form.control}
        render={({ field: { ref, onBlur, onChange, ...restField } }) => (
          <Field className="group">
            <FieldLabel className="data-invalid:text-error">Name</FieldLabel>
            <TextField
              type="password"
              onValueChange={onChange}
              className="border border-gray-400 group-data-invalid:border-error"
              {...restField}
            >
              <TextFieldInput
                ref={ref}
                placeholder="Name"
                onBlur={onBlur}
                // className="group-data-invalid:placeholder:text-error"
              />
              <TextFieldMaskToggle />
            </TextField>
            <FieldError />
          </Field>
        )}
      />
      <FieldController
        name="employed"
        control={form.control}
        render={({ field }) => (
          <Field className="group">
            <FieldLabel className="data-invalid:text-error">
              Employed
            </FieldLabel>
            <Switch
              checked={field.value}
              inputRef={field.ref}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              classList={{
                thumb: "group-data-invalid:bg-error",
              }}
            />
            {/* <Checkbox
              checked={field.value}
              inputRef={field.ref}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              className="group-data-invalid:!border-red-500"
            /> */}
            <FieldError />
          </Field>
        )}
      />
      <FieldController
        name="age"
        control={form.control}
        render={({ field: { ref, onChange, onBlur, ...restField } }) => (
          <Field className="group">
            <FieldLabel className="data-invalid:text-error">Age</FieldLabel>
            <Slider
              {...restField}
              inputRef={ref}
              onValueChange={onChange}
              onThumbBlur={onBlur}
              classList={{
                thumb: "group-data-invalid:bg-error",
              }}
            />
            <FieldError />
          </Field>
        )}
      />
      <FieldController
        control={form.control}
        name="favoriteAnimal"
        render={({ field: { ref, onChange, ...fieldProps } }) => (
          <Field render={<Fieldset />} className="group">
            <FieldsetLegend className="data-invalid:text-error">
              Favorite Animal
            </FieldsetLegend>
            {/* <RadioGroup {...fieldProps} inputRef={ref} onValueChange={onChange}>
              {ANIMAL.map((animal) => (
                <FieldLabel
                  key={animal}
                  className="flex capitalize items-center gap-2"
                >
                  <Radio
                    value={animal}
                    classList={{
                      root: "group-data-invalid:!border-error",
                    }}
                  />
                  {animal}
                </FieldLabel>
              ))}
            </RadioGroup> */}
            <Select value={fieldProps.value} onValueChange={onChange}>
              <SelectTrigger onBlur={fieldProps.onBlur}>
                <SelectValue className="capitalize">
                  {(value: (typeof ANIMALS)[number] | null) => {
                    if (value == null) return "Select Animal";

                    return value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectPositioner>
                <SelectPopup>
                  {ANIMALS.map((animal) => (
                    <SelectItem
                      key={animal}
                      value={animal}
                      className="capitalize"
                    >
                      {animal}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </SelectPositioner>
            </Select>
            <FieldError />
          </Field>
        )}
      />
      <FieldController
        name="salary"
        control={form.control}
        render={({ field: { ref, onChange, onBlur, ...restField } }) => (
          <Field className="group">
            <FieldLabel className="data-invalid:text-error">Salary</FieldLabel>
            <NumberField {...restField} disabled onValueChange={onChange}>
              <NumberFieldDecrement />
              <NumberFieldInput ref={ref} onBlur={onBlur} />
              <NumberFieldIncrement />
            </NumberField>
            <FieldError />
          </Field>
        )}
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
}

import { Controller, Control, Path, RegisterOptions, FieldValues } from "react-hook-form";
import { TextField } from "@mui/material";

export default function FormField<T extends FieldValues>({ name, control, label, rules, type, shouldUnregister, multiline, rows }: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  rules?: RegisterOptions<T>;
  type?: string;
  shouldUnregister?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          label={label}
          type={type}
          variant='outlined'
          color='warning'
          size='small'
          fullWidth
          multiline={multiline}
          rows={rows}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );
}

import { Controller, Control, Path, RegisterOptions, FieldValues } from "react-hook-form";
import { MenuItem, Skeleton, TextField } from "@mui/material";

const menuSlotProps = {
  select: {
    MenuProps: {
      slotProps: { paper: { style: { marginTop: '4px', maxHeight: '200px' } } },
    },
  },
};

export default function FormSelect<T extends FieldValues>({ name, control, label, rules, options, disabled, shouldUnregister, isLoading }: {
  name: Path<T>;
  control: Control<T>;
  label: string;
  rules?: RegisterOptions<T>;
  options?: { id: number; nombre: string }[];
  disabled?: boolean;
  shouldUnregister?: boolean;
  isLoading?: boolean;
}) {
  if (isLoading) return <Skeleton variant='rectangular' width='100%' height={40} sx={{ borderRadius: 1 }} />;
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
          variant='outlined'
          color='warning'
          size='small'
          select
          fullWidth
          error={!!error}
          helperText={error?.message}
          disabled={disabled || !options?.length}
          slotProps={menuSlotProps}
        >
          {options?.map(o => (
            <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}

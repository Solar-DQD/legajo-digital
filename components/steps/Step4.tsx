import { useFieldArray, useFormContext } from "react-hook-form";
import StepWrapper from "@/components/common/StepWrapper";
import { LegajoFormData } from "@/lib/types/legajo";
import { Button } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FormField from "@/components/common/FormField";
import FormDatePicker from "@/components/common/FormDatePicker";

export default function Step4({
  onNext,
  onBack
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  //hooks
  const form = useFormContext<LegajoFormData>();
  const array = useFieldArray({
    control: form.control,
    name: 'experiencias'
  });
  // Validar campos del array de experiencias
  const experienciaFields = array.fields.length > 0
    ? array.fields.flatMap((_, index) => [
        `experiencias.${index}.empresa`,
        `experiencias.${index}.puesto`,
        `experiencias.${index}.sector`,
        `experiencias.${index}.desde`,
        `experiencias.${index}.descripcion`
      ])
    : [];

  return (
    <StepWrapper
      onNext={onNext}
      onBack={onBack}
      title='Experiencia Laboral'
      subtitle='Tus trabajos anteriores'
      trigger={form.trigger}
      fieldNames={experienciaFields}
    >
      <div className='flex flex-col w-full gap-2 overflow-auto'>
        {array.fields.map((field, index) => (
          <div key={field.id} className='flex flex-col gap-4 border border-orange-500 p-4 rounded'>
            <FormField name={`experiencias.${index}.empresa` as const} control={form.control} label='Empresa' rules={{ required: 'Campo obligatorio' }} />
            <FormField name={`experiencias.${index}.puesto` as const} control={form.control} label='Puesto / Rol' rules={{ required: 'Campo obligatorio' }} />
            <FormField name={`experiencias.${index}.sector` as const} control={form.control} label='Sector / Rubro' rules={{ required: 'Campo obligatorio' }} />
            <div className='flex w-full gap-2'>
              <FormDatePicker name={`experiencias.${index}.desde` as const} control={form.control} label='Desde' monthYear onChangeExtra={() => form.trigger(`experiencias.${index}.hasta`)} rules={{ required: 'Campo obligatorio', validate: (v) => {
                if (!v || typeof v !== 'string') return true;
                const [dM, dY] = v.split('-').map(Number);
                const now = new Date();
                const nowY = now.getFullYear();
                const nowM = now.getMonth() + 1;
                return dY < nowY || (dY === nowY && dM <= nowM) || 'La fecha de inicio no puede ser en el futuro';
              }}} />
              <FormDatePicker name={`experiencias.${index}.hasta` as const} control={form.control} label='Hasta' monthYear rules={{ validate: (v) => {
                if (!v || typeof v !== 'string') return true;
                const desde = form.getValues(`experiencias.${index}.desde`);
                if (!desde) return true;
                const [dM, dY] = desde.split('-').map(Number);
                const [hM, hY] = v.split('-').map(Number);
                return hY > dY || (hY === dY && hM >= dM) || 'La fecha de fin no puede ser anterior a la fecha de inicio';
              }}} />
            </div>
             <FormField name={`experiencias.${index}.descripcion` as const} control={form.control} label='Descripción de Tareas' multiline rows={5} rules={{ required: 'Campo obligatorio' }} />
            <Button
              variant='outlined'
              color='error'
              className='!bg-red-100 hover:!bg-white'
              fullWidth
              size='small'
              disableElevation
              onClick={() => array.remove(index)}
            >
              Eliminar
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant='outlined'
        color='warning'
        className='!border !border-dashed !border-orange-600'
        fullWidth
        disableElevation
        endIcon={<AddRoundedIcon />}
        onClick={() => array.append({ empresa: '', puesto: '', sector: '', desde: '', hasta: '', descripcion: '' })}
      >
        Agregar Experiencia
      </Button>
    </StepWrapper>
  );
}

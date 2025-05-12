import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export const useStep = <T extends string>(steps: Readonly<T[]>) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultStep = steps[0];

  const stepParam = searchParams.get("step") as T | null;
  const step = steps.includes(stepParam as T) ? (stepParam as T) : defaultStep;

  const setStep = (newStep: T) => {
    const params = new URLSearchParams(searchParams);
    params.set("step", newStep);
    router.push(`?${params.toString()}`);
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  return { step, setStep, nextStep, prevStep };
};

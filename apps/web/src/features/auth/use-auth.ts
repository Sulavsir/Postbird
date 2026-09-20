import { useMutation } from "@tanstack/react-query";
import { authService } from "./auth.service";
import { useAuth } from "./auth-context";

export function useLogin() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: setSession,
  });
}

export function useRegister() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: authService.register,
    onSuccess: setSession,
  });
}

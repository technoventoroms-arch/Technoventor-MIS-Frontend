import { Button } from "@mono/shared_ui/components/ui/button";
import type { SignupType } from "../profile-to-ui-context";

export function SignupTypeSelector({
  value,
  onChange,
}: {
  value: SignupType;
  onChange: (nextValue: SignupType) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Sign up as</p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={value === "member" ? "default" : "outline"}
          onClick={() => onChange("member")}
        >
          Signup as Member
        </Button>
        <Button
          type="button"
          variant={value === "organisation" ? "default" : "outline"}
          onClick={() => onChange("organisation")}
        >
          Signup as Organisation
        </Button>
      </div>
    </div>
  );
}

import { Input } from "@mono/shared_ui/components/ui/input";
import { Label } from "@mono/shared_ui/components/ui/label";

type CommonSignupFields = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  onChange: (field: "firstName" | "lastName" | "email" | "phoneNumber" | "password", value: string) => void;
};

export function MemberSignupFields({
  firstName,
  lastName,
  email,
  phoneNumber,
  password,
  onChange,
}: CommonSignupFields) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(event) => onChange("firstName", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(event) => onChange("lastName", event.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => onChange("email", event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(event) => onChange("phoneNumber", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => onChange("password", event.target.value)}
          required
        />
      </div>
    </>
  );
}

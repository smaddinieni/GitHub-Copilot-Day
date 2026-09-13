import type { AgentRole } from "../domain/types";

type RoleBoundaryProps = {
  role: AgentRole;
  authority: string;
  restriction: string;
};

export function RoleBoundary({
  role,
  authority,
  restriction,
}: RoleBoundaryProps) {
  return (
    <article className={`role-boundary role-boundary--${role.toLowerCase()}`}>
      <p className="stamped-label">ROLE LOCK</p>
      <h2>{role}</h2>
      <p>{authority}</p>
      <p className="restriction">{restriction}</p>
    </article>
  );
}

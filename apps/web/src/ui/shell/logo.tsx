import type { ReactElement } from 'react';

import logoUrl from '../../assets/web-theft-auto-san-andreas.png';

interface LogoProps {
  /** Modifier classes driving the intro animation (e.g. `sa-logo--pulse sa-logo--small`). */
  className?: string;
}

export function Logo({ className }: LogoProps): ReactElement {
  return (
    <div className={className ? `sa-logo ${className}` : 'sa-logo'}>
      <img alt="Web Theft Auto San Andreas" src={logoUrl} />
    </div>
  );
}

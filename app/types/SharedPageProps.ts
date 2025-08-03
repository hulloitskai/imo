import { type PageProps } from "@inertiajs/core";

import { type PageCSRF } from ".";

export default interface SharedPageProps extends PageProps {
  csrf: PageCSRF;
  flash: {
    notice?: string;
    alert?: string;
  };
}

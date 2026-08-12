declare module "swagger-ui-react" {
  import * as React from "react";

  interface SwaggerUIProps {
    url?: string;
    spec?: object;
    [key: string]: unknown;
  }

  const SwaggerUI: React.ComponentType<SwaggerUIProps>;

  export default SwaggerUI;
}
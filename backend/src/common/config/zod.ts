import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

/** Extends Zod with OpenAPI support */
extendZodWithOpenApi(z);

/** Exports the extended Zod instance. If you need to use `zod` with OpenAPI support then use this instance */
export { z };

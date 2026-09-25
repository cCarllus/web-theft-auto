FROM node:24-bookworm-slim

WORKDIR /workspace

# Copy dependency manifests first so dependency installation remains cacheable.
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/viewer/package.json ./apps/viewer/package.json
COPY packages/game/package.json ./packages/game/package.json
COPY packages/game-build/package.json ./packages/game-build/package.json
COPY packages/loaders/package.json ./packages/loaders/package.json
COPY packages/renderware/package.json ./packages/renderware/package.json
COPY packages/vfs/package.json ./packages/vfs/package.json
COPY tools/lod-generator/package.json ./tools/lod-generator/package.json
COPY tools/map-optimizer/package.json ./tools/map-optimizer/package.json
COPY tools/rw-codec/package.json ./tools/rw-codec/package.json
COPY tools/timecyc-builder/package.json ./tools/timecyc-builder/package.json
COPY tools/tool-kit/package.json ./tools/tool-kit/package.json
COPY tools/vehicle-optimizer/package.json ./tools/vehicle-optimizer/package.json

# Husky is a host-side Git hook helper; the image intentionally has no .git directory.
RUN HUSKY=0 npm ci

COPY . .

EXPOSE 5173 3002

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

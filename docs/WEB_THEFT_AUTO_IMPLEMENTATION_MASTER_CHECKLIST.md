# Web Theft Auto / OpenSA — Master Checklist de Implementação

> Inventário auditado no repositório **cCarllus/web-theft-auto**, branch `main`, commit `ec6021e47eb7c7e1bf7cd138419b89939a450132`.
>
> Auditoria gerada em **2026-09-19**.
>
> Este documento replica a ideia do checklist usado no SanAndreasUnity: uma camada de **roadmap de sistemas** + um **inventário literal dos arquivos de código** encontrados no snapshot.
>
> **Importante:** o status de um sistema considera runtime real, documentação de feature/roadmap e arquivos existentes. A presença de um parser ou classe isolada não transforma uma feature de GTA SA em “completa”.

## Legenda

- ✅ Implementação substancial presente e utilizável no escopo atual.
- 🟡 Implementação parcial, infraestrutura pronta ou cobertura GTA SA incompleta.
- ❌ Sistema de gameplay ausente/não encontrado no snapshot auditado.
- 📦 Dependência/terceiro; não é backlog de gameplay.
- 🧪 Arquivo de teste.
- 🛠️ Tooling/configuração.

## Resumo confirmado do snapshot

- **698 arquivos** versionados no tree do commit auditado.
- **460 arquivos de código** (`.ts`, `.tsx`, `.cjs`).
- **288 arquivos de runtime/tooling/config** fora da classificação de teste.
- **172 arquivos de teste/spec/e2e**.
- Extensões de código: **439 .ts**, **19 .tsx**, **2 .cjs**.
- Roadmap de paridade GTA SA abaixo: **12 ✅**, **16 🟡**, **26 ❌**, **1 📦**.
- O `package.json` deste snapshot identifica a base como **OpenSA 0.2.0** e usa **Three.js + Rapier**.
- O próprio `roadmap.md` marca Weapons, Peds spawning, Veh paths, Rain/Sandstorm, Interiors, Health, HUD completo, Sound e classes especiais de veículos como trabalhos futuros.

### Distribuição dos arquivos de código

| Área | Total | Runtime/tooling | Testes |
|---|---:|---:|---:|
| apps/web | 35 | 31 | 4 |
| apps/viewer | 4 | 4 | 0 |
| packages/game | 111 | 67 | 44 |
| packages/renderware | 143 | 72 | 71 |
| packages/loaders | 25 | 16 | 9 |
| packages/vfs | 5 | 3 | 2 |
| packages/game-build | 2 | 1 | 1 |
| scripts | 21 | 20 | 1 |
| tools | 101 | 67 | 34 |
| e2e | 6 | 0 | 6 |
| root/config | 7 | 7 | 0 |

# Parte I — Roadmap de sistemas para GTA San Andreas completo

## 1. ✅ Bootstrap / Loader do jogo

- **Descrição / estado atual:** Boot web, catálogo de jogos, seleção de loader, warmup e inicialização do runtime estão implementados.
- **Arquivos/base relacionados:** `apps/web/src/ui/shell/boot-machine.ts`, `apps/web/src/ui/shell/use-asset-boot.ts`, `apps/web/src/game-config.tsx`, `packages/game/src/game.ts`
- **Gap / próxima ação:** Completar somente conforme novos sistemas de gameplay exigirem inicialização adicional.

## 2. ✅ Archives IMG / arquivos soltos

- **Descrição / estado atual:** Leitura de IMG VER2, arquivos da instalação local, cache e resolução de paths estão presentes.
- **Arquivos/base relacionados:** `packages/renderware/src/archive/img-archive.ts`, `packages/renderware/src/archive/asset-fs.ts`, `packages/loaders/src/asset-local-loader/img-reader.ts`
- **Gap / próxima ação:** Sem necessidade de reimplementar para GTA SA; VER1 não é necessário.

## 3. ✅ RenderWare DFF / TXD

- **Descrição / estado atual:** DFF/TXD, materiais, skins, texturas, MatFX, plugins SA, UV animations e builders Three estão implementados.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/binary/dff.ts`, `packages/renderware/src/parsers/binary/txd.ts`, `packages/renderware/src/three/build-clump.ts`, `packages/renderware/src/three/build-texture.ts`
- **Gap / próxima ação:** Há gaps de casos raros, como HAnim IDs e alguns pipelines, mas a base GTA SA está funcional.

## 4. ✅ Colisões COL

- **Descrição / estado atual:** COL v2/v3, colisão embutida em DFF, índice de colisões e binding para Rapier estão implementados.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/binary/col.ts`, `packages/renderware/src/collision/build-colliders.ts`, `packages/game/src/streaming/collision-streaming.system.ts`
- **Gap / próxima ação:** Faltam moving colliders e uso completo dos materiais de superfície.

## 5. ✅ IDE / IPL / DAT / placements

- **Descrição / estado atual:** Parsers para gta.dat, IDE, IPL texto/binário e diversos DAT usados pelo mundo estão presentes.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/text/gta-dat.parser.ts`, `packages/renderware/src/parsers/text/ide.parser.ts`, `packages/renderware/src/parsers/text/ipl.parser.ts`, `packages/renderware/src/parsers/text/ipl-binary.parser.ts`
- **Gap / próxima ação:** Seções de gameplay como enex, grge, pick, jump, auzo, mult e occlu ainda são ignoradas.

## 6. ✅ World streaming / Cells / LOD

- **Descrição / estado atual:** Streaming por grid, HD/LOD, collision streaming, swap sem blink e cache por adapter estão implementados.
- **Arquivos/base relacionados:** `packages/game/src/streaming/streaming.system.ts`, `packages/game/src/streaming/collision-streaming.system.ts`, `packages/renderware/src/map/world-grid.ts`
- **Gap / próxima ação:** Não há occlusion culling original; novos NPCs/traffic deverão integrar-se ao orçamento de streaming.

## 7. ✅ Água

- **Descrição / estado atual:** water.dat, quads, oceano e shader de água estão implementados visualmente.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/text/water.parser.ts`, `packages/renderware/src/three/build-water.ts`, `packages/game/src/plugins/water.plugin.ts`
- **Gap / próxima ação:** Sem natação, buoyancy, underwater state e física aquática.

## 8. ❌ Interiores / ENEX

- **Descrição / estado atual:** O parser reconhece area codes para filtrar interiores, mas mundos interiores e ENEX de gameplay não estão implementados.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/text/interior.ts`, `packages/renderware/src/map/resolve-map.ts`, `docs/features/map-pipeline.md`
- **Gap / próxima ação:** Implementar ENEX, interior worlds, streaming por interior e transições.

## 9. ❌ Path nodes GTA

- **Descrição / estado atual:** Não foi encontrado parser/runtime para nodes*.dat de pedestres/veículos.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar parser e grafo de paths originais.

## 10. ❌ Navegação / Pathfinding de NPC

- **Descrição / estado atual:** Existe auto-run simples do player para porta de veículo, mas não há sistema geral de navegação de NPCs.
- **Arquivos/base relacionados:** `packages/game/src/character/character-controller.system.ts`, `packages/game/src/vehicle/enter-vehicle.system.ts`
- **Gap / próxima ação:** Criar navegação GTA path-node + steering/avoidance.

## 11. ✅ Dia e noite

- **Descrição / estado atual:** Game clock, timecyc, timed objects, night factor, sky/stars/moon e iluminação noturna existem.
- **Arquivos/base relacionados:** `packages/game/src/time/game-clock.ts`, `packages/game/src/time/timed-object.system.ts`, `packages/game/src/plugins/sky.plugin.ts`
- **Gap / próxima ação:** Ajustes de fidelidade ficam como calibração.

## 12. 🟡 Clima completo

- **Descrição / estado atual:** Weather manager, zonas e transições existem e alimentam timecyc/sky/fog.
- **Arquivos/base relacionados:** `packages/game/src/weather/weather-transition.ts`, `packages/game/src/weather/weather-zones.ts`, `packages/game/src/plugins/cloud-profile.ts`
- **Gap / próxima ação:** Roadmap/documentação confirmam ausência de precipitação funcional de chuva e sandstorm.

## 13. 🟡 Semáforos / luzes 2DFX

- **Descrição / estado atual:** 2DFX lights/coronas são parseados e renderizados, inclusive traffic lights.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/binary/dff.ts`, `packages/renderware/src/three/corona.ts`, `docs/features/night-and-time.md`
- **Gap / próxima ação:** Não existe ciclo vermelho/amarelo/verde; atualmente os bulbs podem aparecer simultaneamente.

## 14. ❌ Spawn / população de pedestres

- **Descrição / estado atual:** peds.ide é parseado apenas para resolver o personagem selecionado. Não há population manager.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/text/ped-defs.parser.ts`, `docs/features/character.md`, `roadmap.md`
- **Gap / próxima ação:** Implementar popcycle/zonas/grupos, spawn/despawn e densidade.

## 15. ❌ IA de pedestres

- **Descrição / estado atual:** Não existem módulos de IA ambiente de peds no runtime atual.
- **Arquivos/base relacionados:** `docs/features/character.md`, `roadmap.md`
- **Gap / próxima ação:** Criar perception/events/decision makers, wander, avoid, flee, combat, social, services etc.; consultar SanAndreasUnity/gta-reversed.

## 16. ❌ Policiais base

- **Descrição / estado atual:** Não foram encontrados sistemas dedicados de polícia/dispatch.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar cops, arrest/attack, pursuit e dispatch.

## 17. ❌ Wanted Level / estrelas

- **Descrição / estado atual:** Não foram encontrados Crime/Wanted manager, estrelas ou escalonamento policial.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Criar wanted 0–6, crimes, decay, witnesses e dispatch.

## 18. ❌ Gangs / seguidores

- **Descrição / estado atual:** Não foram encontrados sistemas de gangues, recrutamento ou followers.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Criar relações, gangs, follow/formations, territories/gang wars.

## 19. 🟡 State machine do Ped / movimento

- **Descrição / estado atual:** Player possui walk/run/jump, aceleração, grounded, animação locomotion e scripted run-to-door.
- **Arquivos/base relacionados:** `packages/game/src/character/character-controller.system.ts`, `packages/game/src/character/character-animation.system.ts`, `packages/game/src/character/animation-controller.ts`
- **Gap / próxima ação:** Faltam crouch, combat, swim, climb e estados completos de GTA SA.

## 20. 🟡 CJ / player modular

- **Descrição / estado atual:** O runtime carrega um mainCharacter configurável de peds.ide com skin/skeleton.
- **Arquivos/base relacionados:** `packages/game/src/character/setup-character.ts`, `packages/renderware/src/three/build-skinned-clump.ts`, `apps/web/src/game-config.tsx`
- **Gap / próxima ação:** Sem CJ modular, clothes, body stats, hair/tattoo e player.img wardrobe.

## 21. ❌ Áudio de movimento do Ped

- **Descrição / estado atual:** Não há pipeline de footsteps/surface audio no código atual.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar surfaud/surface footsteps, jump/land e sons de movimento.

## 22. ❌ Armas

- **Descrição / estado atual:** Roadmap marca Weapons como próxima iteração e não existem módulos weapon/shoot/reload/damage no tree.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar weapon data, inventory/slots, aiming, shooting, melee, ammo, reload, projectiles/explosions.

## 23. ✅ Spawn de veículos

- **Descrição / estado atual:** Veículos configurados podem ser colocados no mundo; há debug spawn e parked placements.
- **Arquivos/base relacionados:** `apps/web/src/game-config.tsx`, `apps/web/src/ui/debug/debug-overlay.tsx`, `packages/game/src/adapters/gta-sa-world.adapter.ts`
- **Gap / próxima ação:** Ainda não é população de tráfego dinâmica.

## 24. ✅ Física de veículos / handling

- **Descrição / estado atual:** Rapier dynamic chassis, raycast wheels, suspensão, steering/engine/brake e handling.cfg estão integrados.
- **Arquivos/base relacionados:** `packages/game/src/vehicle/vehicle-physics.system.ts`, `packages/renderware/src/parsers/text/handling.parser.ts`, `packages/game/src/physics/physics-world.ts`
- **Gap / próxima ação:** Roadmap ainda pede refinamentos, surface.dat e classes especiais.

## 25. 🟡 Damage de veículos

- **Descrição / estado atual:** Impactos fortes trocam peças para _dam e segunda colisão pode destacá-las.
- **Arquivos/base relacionados:** `packages/game/src/vehicle/vehicle-damage.system.ts`, `packages/game/src/vehicle/vehicle-part.ts`
- **Gap / próxima ação:** Não cobre toda fidelidade GTA SA, fogo/explosão e todos estados/peças.

## 26. 🟡 Entrar / sair / assentos

- **Descrição / estado atual:** Sequência de aproximação, porta, animação, seat e saída do driver está implementada.
- **Arquivos/base relacionados:** `packages/game/src/vehicle/enter-vehicle.system.ts`, `packages/game/src/vehicle/vehicle-door.ts`
- **Gap / próxima ação:** Documentação/roadmap indicam driver-side como base; faltam passageiros e diversos edge cases GTA.

## 27. ❌ Drive-by

- **Descrição / estado atual:** Não foram encontrados estados/sistemas de tiro dentro do veículo.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Depende de armas + seats.

## 28. ❌ Rádio

- **Descrição / estado atual:** Não existe reprodução das estações originais no runtime atual.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar pipeline de áudio/radio e integração com veículos.

## 29. ❌ Tráfego de carros com motoristas IA

- **Descrição / estado atual:** Roadmap marca Veh paths como pendente; não existe traffic population/driver AI.
- **Arquivos/base relacionados:** `roadmap.md`, `docs/features/vehicles.md`
- **Gap / próxima ação:** Implementar vehicle path nodes, drivers, signals, avoidance e spawn/despawn.

## 30. 🟡 HUD

- **Descrição / estado atual:** HUD DOM possui relógio e zone-name.
- **Arquivos/base relacionados:** `apps/web/src/ui/hud/hud.tsx`, `apps/web/src/ui/hud/overlay.tsx`, `docs/features/zones-hud-debug.md`
- **Gap / próxima ação:** Sem health bar, armor, money, weapon/ammo, wanted stars e radar.

## 31. 🟡 Minimapa / mapa

- **Descrição / estado atual:** Há map inspector/debug viewer, mas não radar/minimapa de gameplay.
- **Arquivos/base relacionados:** `apps/web/src/ui/debug/map-inspector.tsx`, `docs/features/zones-hud-debug.md`
- **Gap / próxima ação:** Criar radar, blips, map menu e route/mission markers.

## 32. 🟡 GXT / textos originais

- **Descrição / estado atual:** Parser GXT e lookup são usados para nomes de zonas.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/binary/gxt.ts`, `packages/game/src/zones/zone-name.system.ts`
- **Gap / próxima ação:** Falta serviço geral de localization/text para HUD, prompts, lojas e missões.

## 33. 🟡 Fontes GTA

- **Descrição / estado atual:** Há carregamento de fontes para o HUD, mas não um pipeline completo das fontes originais do frontend/HUD SA.
- **Arquivos/base relacionados:** `apps/web/src/ui/hud/load-fonts.ts`, `apps/web/src/assets/fonts/SixCaps-Regular.ttf`
- **Gap / próxima ação:** Implementar/usar font assets e métricas GTA onde permitido pelo bring-your-own-assets.

## 34. ✅ Menus / UI base

- **Descrição / estado atual:** Shell React possui menu, disclaimer, folder prompt, loading, retry, pause e fullscreen.
- **Arquivos/base relacionados:** `apps/web/src/ui/shell/app.tsx`, `apps/web/src/ui/shell/menu.tsx`, `apps/web/src/ui/shell/boot-machine.ts`
- **Gap / próxima ação:** Paridade visual/funcional com frontend GTA é item 51.

## 35. ❌ Multiplayer

- **Descrição / estado atual:** Não existe camada de rede de gameplay no tree atual.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Projetar depois do single-player: authority, replication, interest management e netcode.

## 36. ❌ Chat / comandos

- **Descrição / estado atual:** Não foram encontrados chat/command systems.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Só necessário com multiplayer/admin tooling futuro.

## 37. 🟡 Game Modes / extensibilidade

- **Descrição / estado atual:** Existe catálogo multi-game e contrato WorldMod, mas não framework de modos de gameplay.
- **Arquivos/base relacionados:** `apps/web/src/game-config.tsx`, `packages/game/src/mods/mod.interface.ts`, `packages/game/src/mods/wind.mod.ts`
- **Gap / próxima ação:** Criar game/session modes se necessário.

## 38. ❌ Economia / dinheiro / lojas

- **Descrição / estado atual:** Não foram encontrados money/cash/shop/economy systems.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Criar economia e lojas após HUD/interiores/pickups.

## 39. ❌ Roupas / wardrobe

- **Descrição / estado atual:** Roadmap marca CJ Clothes pendente.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar roupas por partes, lojas e persistência.

## 40. ❌ Barbearia / tatuagem

- **Descrição / estado atual:** Não foram encontrados sistemas de barber/tattoo.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Depende de customização do CJ + economia + interiores.

## 41. ❌ Comida / academia / corpo

- **Descrição / estado atual:** Roadmap marca CJ Bodies pendente; food/gym/body progression não existe.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar stats, fat/muscle/stamina, food e gym.

## 42. ❌ Propriedades compráveis

- **Descrição / estado atual:** Não foram encontrados property ownership systems.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Depende de economia + savegame.

## 43. ❌ Garagens / Pay'n'Spray

- **Descrição / estado atual:** Não foram encontrados sistemas de garage/paynspray.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar garage zones/doors, repair/respray, money e persistência.

## 44. ❌ Savegame / campanha persistente

- **Descrição / estado atual:** Não existe sistema de savegame de gameplay.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Definir schema versionado após os sistemas persistentes existirem.

## 45. ❌ Missões / main.scm / opcodes

- **Descrição / estado atual:** Não existem arquivos/módulos SCM, CLEO, mission ou opcode no snapshot auditado.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Criar parser/VM/scheduler/opcodes e integrar aos sistemas de gameplay.

## 46. ❌ Pickups GTA

- **Descrição / estado atual:** Não foi encontrado sistema de pickups.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Criar pickups de weapon/health/armor/money/bribes/collectibles.

## 47. 🟡 Animações

- **Descrição / estado atual:** IFP ANP3, clips, skinned animation, locomotion, vehicle enter/exit e animated map objects existem.
- **Arquivos/base relacionados:** `packages/renderware/src/parsers/binary/ifp.ts`, `packages/renderware/src/three/build-anim-clip.ts`, `packages/game/src/character/character-animation.system.ts`
- **Gap / próxima ação:** Cobertura de animações de gameplay ainda é pequena: combat, swim, climb, activities etc.

## 48. ❌ Morte / ragdoll

- **Descrição / estado atual:** Não há death/corpse/ragdoll system no snapshot.
- **Arquivos/base relacionados:** `roadmap.md`
- **Gap / próxima ação:** Implementar health/damage de peds, death states, corpse e ragdoll/anim death.

## 49. 🟡 Respawn

- **Descrição / estado atual:** Há respawn/teleport de debug para o player.
- **Arquivos/base relacionados:** `apps/web/src/ui/debug/debug-overlay.tsx`, `packages/game/src/character/setup-character.ts`
- **Gap / próxima ação:** Não equivale a hospital/police respawn, penalties ou mission restart.

## 50. 🟡 Câmera

- **Descrição / estado atual:** Follow camera, mouse look, auto-trail, zoom e debug tuning existem.
- **Arquivos/base relacionados:** `packages/game/src/core/camera-controller.ts`, `docs/features/character.md`
- **Gap / próxima ação:** Roadmap ainda pede câmera GTA-SA-like e faltam câmeras de weapons/missions/cutscenes.

## 51. 🟡 Frontend estilo GTA SA

- **Descrição / estado atual:** Existe shell web funcional, mas não o frontend/menu completo de GTA SA.
- **Arquivos/base relacionados:** `apps/web/src/ui/shell/`, `docs/features/ui-shell.md`
- **Gap / próxima ação:** Criar map/stats/save/load/audio/display/controller pages e identidade Web Theft Auto.

## 52. 🟡 Objetos destrutíveis

- **Descrição / estado atual:** Breakable plugin, debris, collision removal, object.dat e vehicle-impact trigger estão implementados em nível funcional.
- **Arquivos/base relacionados:** `packages/renderware/src/three/breakable.ts`, `packages/renderware/src/three/build-debris.ts`, `docs/features/breakable-objects.md`
- **Gap / próxima ação:** Ainda faltam real shard physics, sons e alguns efeitos pós-quebra/damaged states.

## 53. ❌ Sons de veículos

- **Descrição / estado atual:** Documentação de veículos confirma ausência de vehicle audio; não existem módulos audio no tree.
- **Arquivos/base relacionados:** `docs/features/vehicles.md`, `roadmap.md`
- **Gap / próxima ação:** Implementar engine loops, crash/skid/doors/horn/sirens e depois rádio.

## 54. ✅ Ferramentas de desenvolvimento

- **Descrição / estado atual:** Debugger F2, viewers, scripts de inspeção e ferramentas offline de otimização estão amplamente implementados.
- **Arquivos/base relacionados:** `apps/web/src/ui/debug/`, `apps/viewer/src/`, `scripts/debug/`, `tools/`
- **Gap / próxima ação:** Manter e ampliar conforme novas features.

## 55. 📦 Bibliotecas de terceiros

- **Descrição / estado atual:** Three.js, Rapier, bitecs, React, Vite, Vitest, Playwright, fflate e tooling compõem a base externa.
- **Arquivos/base relacionados:** `package.json`
- **Gap / próxima ação:** Não são backlog de gameplay; alterar apenas por necessidade técnica.

# Parte II — Capacidades específicas da base OpenSA/Web Theft Auto

## 56. ✅ Asset pipeline Web / build de game

- **Estado atual:** `build:game:original` seleciona, particiona e empacota assets para `static/<game>-<version>/` em chunks com manifest.
- **Arquivos/base relacionados:** `scripts/build-game.ts`, `packages/game-build/src/partition.ts`

## 57. ✅ VFS + loaders local/fetch

- **Estado atual:** Há loaders por fetch/cache e por instalação local Chromium, ambos entregando a mesma AssetFileSystem/VFS.
- **Arquivos/base relacionados:** `packages/loaders/src/`, `packages/vfs/src/`

## 58. ✅ ProcObj / clutter procedural

- **Estado atual:** procobj.dat + surfinfo, scatter determinístico, categorias, collision subset e debug knobs estão presentes.
- **Arquivos/base relacionados:** `packages/renderware/src/map/procobj-runtime.ts`, `packages/renderware/src/map/procobj-scatter.ts`

## 59. 🟡 World effects / partículas

- **Estado atual:** 2DFX particles, effects.fxp e escalators visuais existem em MVP.
- **Arquivos/base relacionados:** `packages/renderware/src/three/build-particles.ts`, `packages/renderware/src/three/build-escalator.ts`
- **Gap / próxima ação:** Heat haze, full tracks, particle rotation/texture anim e escalator physics faltam.

## 60. ✅ Zones / districts

- **Estado atual:** map.zon/info.zon + GXT classificam cidades/distritos e alimentam weather/HUD.
- **Arquivos/base relacionados:** `packages/game/src/zones/`, `packages/renderware/src/parsers/text/zon.parser.ts`

## 61. ✅ Lighting / PostFX / environment graphics

- **Estado atual:** Prelit SA, shadows, night fill, bloom, SSAO, god rays, fog, sky/clouds/stars/moon e reflections estão presentes.
- **Arquivos/base relacionados:** `packages/game/src/plugins/`, `packages/renderware/src/three/world-material.ts`

## 62. ✅ Mods / wind

- **Estado atual:** WorldMod contract e wind mod data-driven já existem.
- **Arquivos/base relacionados:** `packages/game/src/mods/mod.interface.ts`, `packages/game/src/mods/wind.mod.ts`

## 63. ✅ Mobile / touch input

- **Estado atual:** Input combinável com teclado, pointer e touch, incluindo joystick e pinch zoom.
- **Arquivos/base relacionados:** `packages/game/src/input/`, `apps/web/src/ui/controls/`

## 64. ✅ Testes / CI / qualidade

- **Estado atual:** Vitest, Playwright e CI existem; o documento de coverage registra 108 test files/651 passing no escopo headless em 2026-06-13.
- **Arquivos/base relacionados:** `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, `docs/development/test-coverage.md`

# Parte III — O que o snapshot já faz de forma comprovada

A base atual já resolve a parte “engine/conversor” com bastante profundidade: lê a instalação do GTA SA via loader local ou build empacotado, interpreta IMG/DFF/TXD/COL/IDE/IPL/DAT/GXT/IFP, monta mapa e colisões, faz streaming/LOD, controla o player, carrega veículos, aplica física Rapier, animações, timecyc, clima base, sky/water/fog, 2DFX, procobj, breakables, HUD básico, UI shell, debugger e viewers.

O principal bloco ausente é a camada que transforma essa engine em **GTA San Andreas completo como jogo**: população e IA de peds, path nodes, tráfego, armas, polícia/wanted, gangs, áudio/rádio, HUD/radar completo, interiores/ENEX, pickups, economia, customização/progressão do CJ, propriedades/garagens, savegame e campanha/main.scm.

# Parte IV — Ordem de desenvolvimento recomendada

1. Path nodes GTA + navegação.
2. População de pedestres.
3. IA de pedestres completa.
4. Health/damage/death de peds.
5. Armas + combate + pickups.
6. Polícia + Crime/Wanted.
7. Gangs/followers.
8. Tráfego de veículos + traffic lights.
9. Áudio GTA + sons de ped/veículo + rádio.
10. HUD/radar/GXT/fonts completos.
11. Interiores/ENEX.
12. Economia/lojas/customização/progressão.
13. Garagens/propriedades/savegame.
14. SCM/main.scm/missões/campanha.
15. Multiplayer depois que os estados de gameplay estiverem estabilizados.

# Parte V — Regras de migração do SanAndreasUnity

O SanAndreasUnity é **referência**, não engine a ser incorporada.

- Consultar sua lógica quando houver módulo já estudado/implementado.
- Portar comportamento, algoritmos, regras e conhecimento para TypeScript/arquitetura atual.
- Não portar MonoBehaviour, GameObject architecture, Unity NavMesh, WheelCollider, Mirror, prefabs, scenes, `.meta` ou `Library/`.
- Antes de portar algo, verificar se a base OpenSA já resolve o problema.
- Para fidelidade GTA, cruzar com dados originais e, quando necessário, gta-reversed.
- A pasta Unity local pode ser removida quando não contiver mais conhecimento exclusivo necessário à migração.

# Parte VI — Critério para marcar um sistema como ✅

Um item de gameplay só deve virar ✅ quando:

1. existe implementação de runtime, não apenas parser/placeholder;
2. usa os dados/assets GTA adequados quando aplicável;
3. integra-se ao loop real do jogo;
4. foi validado no browser;
5. possui teste automatizado quando a lógica é testável;
6. os edge cases principais estão documentados;
7. não cria regressão relevante em streaming/física/frame time;
8. para paridade GTA, o comportamento foi comparado com uma referência confiável.

# Parte VII — Inventário literal dos 460 arquivos de código

> Ordenado alfabeticamente pelo caminho. Aqui **✅ significa que o arquivo existe como código de produção/tooling**, não que o sistema GTA correspondente esteja completo. Testes recebem 🧪 e arquivos de configuração/tooling recebem 🛠️ quando apropriado.

## 1. 🛠️ `.commitlintrc.cjs`

- **Área:** Config / Tooling
- **Tipo:** Tooling/configuração
- **Descrição:** Implementação de ** Commitlintrc**.
- **Tamanho no snapshot:** 197 bytes

## 2. 🛠️ `.lintstagedrc.cjs`

- **Área:** Config / Tooling
- **Tipo:** Tooling/configuração
- **Descrição:** Implementação de ** Lintstagedrc**.
- **Tamanho no snapshot:** 156 bytes

## 3. ✅ `apps/viewer/src/character-viewer.ts`

- **Área:** Viewers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Ferramenta/viewer de **Character Viewer**.
- **Tamanho no snapshot:** 7115 bytes

## 4. ✅ `apps/viewer/src/object-viewer.ts`

- **Área:** Viewers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Ferramenta/viewer de **Object Viewer**.
- **Tamanho no snapshot:** 9317 bytes

## 5. ✅ `apps/viewer/src/shell.ts`

- **Área:** Viewers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Ferramenta/viewer de **Shell**.
- **Tamanho no snapshot:** 986 bytes

## 6. ✅ `apps/viewer/src/vehicle-viewer.ts`

- **Área:** Viewers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Ferramenta/viewer de **Vehicle Viewer**.
- **Tamanho no snapshot:** 9611 bytes

## 7. 🧪 `apps/web/src/game-config.select.test.ts`

- **Área:** Web / UI
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Game Config Select**.
- **Tamanho no snapshot:** 922 bytes

## 8. ✅ `apps/web/src/game-config.select.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Configuração **Game Config Select**.
- **Tamanho no snapshot:** 490 bytes

## 9. ✅ `apps/web/src/game-config.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Game Config**.
- **Tamanho no snapshot:** 7463 bytes

## 10. ✅ `apps/web/src/main.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Main**.
- **Tamanho no snapshot:** 223 bytes

## 11. ✅ `apps/web/src/standalone/controls-harness.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Controls Harness**.
- **Tamanho no snapshot:** 1981 bytes

## 12. ✅ `apps/web/src/ui/canvas-host.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Canvas Host**.
- **Tamanho no snapshot:** 49928 bytes

## 13. ✅ `apps/web/src/ui/controls/action-button.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Action Button**.
- **Tamanho no snapshot:** 1142 bytes

## 14. ✅ `apps/web/src/ui/controls/is-touch-device.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Is Touch Device**.
- **Tamanho no snapshot:** 313 bytes

## 15. ✅ `apps/web/src/ui/controls/joystick.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Joystick**.
- **Tamanho no snapshot:** 2377 bytes

## 16. ✅ `apps/web/src/ui/controls/touch-controls.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Touch Controls**.
- **Tamanho no snapshot:** 2499 bytes

## 17. ✅ `apps/web/src/ui/controls/use-pinch-zoom.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Use Pinch Zoom**.
- **Tamanho no snapshot:** 1529 bytes

## 18. ✅ `apps/web/src/ui/debug/debug-overlay.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Debug Overlay**.
- **Tamanho no snapshot:** 47899 bytes

## 19. ✅ `apps/web/src/ui/debug/debug-styles.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Debug Styles**.
- **Tamanho no snapshot:** 3806 bytes

## 20. ✅ `apps/web/src/ui/debug/map-inspector.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Map Inspector**.
- **Tamanho no snapshot:** 7303 bytes

## 21. ✅ `apps/web/src/ui/hud/hud.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Hud**.
- **Tamanho no snapshot:** 3363 bytes

## 22. ✅ `apps/web/src/ui/hud/load-fonts.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Load Fonts**.
- **Tamanho no snapshot:** 984 bytes

## 23. ✅ `apps/web/src/ui/hud/overlay.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Overlay**.
- **Tamanho no snapshot:** 758 bytes

## 24. ✅ `apps/web/src/ui/shell/analytics.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Analytics**.
- **Tamanho no snapshot:** 1063 bytes

## 25. ✅ `apps/web/src/ui/shell/app.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **App**.
- **Tamanho no snapshot:** 4124 bytes

## 26. 🧪 `apps/web/src/ui/shell/boot-machine.test.ts`

- **Área:** Web / UI
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Boot Machine**.
- **Tamanho no snapshot:** 2969 bytes

## 27. ✅ `apps/web/src/ui/shell/boot-machine.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Boot Machine**.
- **Tamanho no snapshot:** 3431 bytes

## 28. 🧪 `apps/web/src/ui/shell/boot-status.test.ts`

- **Área:** Web / UI
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Boot Status**.
- **Tamanho no snapshot:** 1184 bytes

## 29. ✅ `apps/web/src/ui/shell/boot-status.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Boot Status**.
- **Tamanho no snapshot:** 1274 bytes

## 30. 🧪 `apps/web/src/ui/shell/boot-storage.test.ts`

- **Área:** Web / UI
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Boot Storage**.
- **Tamanho no snapshot:** 1175 bytes

## 31. ✅ `apps/web/src/ui/shell/boot-storage.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Boot Storage**.
- **Tamanho no snapshot:** 1091 bytes

## 32. ✅ `apps/web/src/ui/shell/disclaimer.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Disclaimer**.
- **Tamanho no snapshot:** 792 bytes

## 33. ✅ `apps/web/src/ui/shell/error-panel.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Error Panel**.
- **Tamanho no snapshot:** 839 bytes

## 34. ✅ `apps/web/src/ui/shell/folder-prompt.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Folder Prompt**.
- **Tamanho no snapshot:** 1324 bytes

## 35. ✅ `apps/web/src/ui/shell/game-hint.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Game Hint**.
- **Tamanho no snapshot:** 2049 bytes

## 36. ✅ `apps/web/src/ui/shell/logo.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Logo**.
- **Tamanho no snapshot:** 697 bytes

## 37. ✅ `apps/web/src/ui/shell/menu.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Menu**.
- **Tamanho no snapshot:** 1679 bytes

## 38. ✅ `apps/web/src/ui/shell/preloader.tsx`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Componente/entrada React de **Preloader**.
- **Tamanho no snapshot:** 552 bytes

## 39. ✅ `apps/web/src/ui/shell/use-asset-boot.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Use Asset Boot**.
- **Tamanho no snapshot:** 7002 bytes

## 40. ✅ `apps/web/src/ui/shell/use-fullscreen.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Use Fullscreen**.
- **Tamanho no snapshot:** 1023 bytes

## 41. ✅ `apps/web/src/vite-env.d.ts`

- **Área:** Web / UI
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Declarações de tipos para **Vite Env D**.
- **Tamanho no snapshot:** 707 bytes

## 42. 🧪 `e2e/asset-fetch-loader.spec.ts`

- **Área:** E2E
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Asset Fetch Loader**.
- **Tamanho no snapshot:** 10994 bytes

## 43. 🧪 `e2e/asset-local-loader.spec.ts`

- **Área:** E2E
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Asset Local Loader**.
- **Tamanho no snapshot:** 6043 bytes

## 44. 🧪 `e2e/object-viewer.spec.ts`

- **Área:** E2E
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Object Viewer**.
- **Tamanho no snapshot:** 2009 bytes

## 45. 🧪 `e2e/shell.spec.ts`

- **Área:** E2E
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Shell**.
- **Tamanho no snapshot:** 2537 bytes

## 46. 🧪 `e2e/touch-controls.spec.ts`

- **Área:** E2E
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Touch Controls**.
- **Tamanho no snapshot:** 4675 bytes

## 47. 🧪 `e2e/viewer-tabs.spec.ts`

- **Área:** E2E
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Viewer Tabs**.
- **Tamanho no snapshot:** 1073 bytes

## 48. 🛠️ `eslint-plugin.d.ts`

- **Área:** Config / Tooling
- **Tipo:** Tooling/configuração
- **Descrição:** Declarações de tipos para **Eslint Plugin D**.
- **Tamanho no snapshot:** 139 bytes

## 49. 🛠️ `eslint.config.ts`

- **Área:** Config / Tooling
- **Tipo:** Tooling/configuração
- **Descrição:** Configuração **Eslint Config**.
- **Tamanho no snapshot:** 9489 bytes

## 50. 🧪 `packages/game-build/src/partition.test.ts`

- **Área:** Game build
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Partition**.
- **Tamanho no snapshot:** 4678 bytes

## 51. ✅ `packages/game-build/src/partition.ts`

- **Área:** Game build
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Partition**.
- **Tamanho no snapshot:** 5086 bytes

## 52. 🧪 `packages/game/src/adapters/gta-sa-world.adapter.integration.test.ts`

- **Área:** Game / Adapters
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Gta Sa World Adapter Integration**.
- **Tamanho no snapshot:** 4727 bytes

## 53. 🧪 `packages/game/src/adapters/gta-sa-world.adapter.test.ts`

- **Área:** Game / Adapters
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Gta Sa World Adapter**.
- **Tamanho no snapshot:** 5913 bytes

## 54. ✅ `packages/game/src/adapters/gta-sa-world.adapter.ts`

- **Área:** Game / Adapters
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Gta Sa World Adapter**.
- **Tamanho no snapshot:** 26502 bytes

## 55. 🧪 `packages/game/src/character/animation-controller.test.ts`

- **Área:** Game / Character
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Animation Controller**.
- **Tamanho no snapshot:** 2071 bytes

## 56. ✅ `packages/game/src/character/animation-controller.ts`

- **Área:** Game / Character
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Animation Controller**.
- **Tamanho no snapshot:** 4281 bytes

## 57. 🧪 `packages/game/src/character/character-animation.system.test.ts`

- **Área:** Game / Character
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Character Animation System**.
- **Tamanho no snapshot:** 3520 bytes

## 58. ✅ `packages/game/src/character/character-animation.system.ts`

- **Área:** Game / Character
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Character Animation System**.
- **Tamanho no snapshot:** 9416 bytes

## 59. 🧪 `packages/game/src/character/character-controller.system.test.ts`

- **Área:** Game / Character
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Character Controller System**.
- **Tamanho no snapshot:** 7272 bytes

## 60. ✅ `packages/game/src/character/character-controller.system.ts`

- **Área:** Game / Character
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Character Controller System**.
- **Tamanho no snapshot:** 7557 bytes

## 61. 🧪 `packages/game/src/character/orient-character.test.ts`

- **Área:** Game / Character
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Orient Character**.
- **Tamanho no snapshot:** 1092 bytes

## 62. ✅ `packages/game/src/character/orient-character.ts`

- **Área:** Game / Character
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Orient Character**.
- **Tamanho no snapshot:** 1480 bytes

## 63. 🧪 `packages/game/src/character/render-sync.system.test.ts`

- **Área:** Game / Character
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Render Sync System**.
- **Tamanho no snapshot:** 1616 bytes

## 64. ✅ `packages/game/src/character/render-sync.system.ts`

- **Área:** Game / Character
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Render Sync System**.
- **Tamanho no snapshot:** 1140 bytes

## 65. ✅ `packages/game/src/character/setup-character.ts`

- **Área:** Game / Character
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Setup Character**.
- **Tamanho no snapshot:** 7138 bytes

## 66. ✅ `packages/game/src/core/camera-controller.ts`

- **Área:** Game / Core
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Camera Controller**.
- **Tamanho no snapshot:** 14068 bytes

## 67. 🧪 `packages/game/src/core/clock.test.ts`

- **Área:** Game / Core
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Clock**.
- **Tamanho no snapshot:** 1051 bytes

## 68. ✅ `packages/game/src/core/clock.ts`

- **Área:** Game / Core
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Clock**.
- **Tamanho no snapshot:** 391 bytes

## 69. ✅ `packages/game/src/core/renderer.ts`

- **Área:** Game / Core
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Renderer**.
- **Tamanho no snapshot:** 782 bytes

## 70. 🧪 `packages/game/src/core/system.test.ts`

- **Área:** Game / Core
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **System**.
- **Tamanho no snapshot:** 2013 bytes

## 71. ✅ `packages/game/src/core/system.ts`

- **Área:** Game / Core
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **System**.
- **Tamanho no snapshot:** 888 bytes

## 72. 🧪 `packages/game/src/diagnostics/logger.test.ts`

- **Área:** Game / Runtime
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Logger**.
- **Tamanho no snapshot:** 1490 bytes

## 73. ✅ `packages/game/src/diagnostics/logger.ts`

- **Área:** Game / Runtime
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Logger**.
- **Tamanho no snapshot:** 2298 bytes

## 74. ✅ `packages/game/src/ecs/components.ts`

- **Área:** Game / ECS
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Components**.
- **Tamanho no snapshot:** 1032 bytes

## 75. ✅ `packages/game/src/ecs/world.ts`

- **Área:** Game / ECS
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **World**.
- **Tamanho no snapshot:** 234 bytes

## 76. 🧪 `packages/game/src/events/event-bus.test.ts`

- **Área:** Game / Events
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Event Bus**.
- **Tamanho no snapshot:** 1109 bytes

## 77. ✅ `packages/game/src/events/event-bus.ts`

- **Área:** Game / Events
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Event Bus**.
- **Tamanho no snapshot:** 955 bytes

## 78. ✅ `packages/game/src/events/events.global.ts`

- **Área:** Game / Events
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Events Global**.
- **Tamanho no snapshot:** 922 bytes

## 79. ✅ `packages/game/src/game.ts`

- **Área:** Game / Runtime
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Game**.
- **Tamanho no snapshot:** 26975 bytes

## 80. ✅ `packages/game/src/index.ts`

- **Área:** Game / Runtime
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Entry point/reexports do módulo **Index**.
- **Tamanho no snapshot:** 1484 bytes

## 81. 🧪 `packages/game/src/input/combine-input.test.ts`

- **Área:** Game / Input
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Combine Input**.
- **Tamanho no snapshot:** 2141 bytes

## 82. ✅ `packages/game/src/input/combine-input.ts`

- **Área:** Game / Input
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de input **Combine Input**.
- **Tamanho no snapshot:** 1581 bytes

## 83. ✅ `packages/game/src/input/index.ts`

- **Área:** Game / Input
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de input **Index**.
- **Tamanho no snapshot:** 499 bytes

## 84. ✅ `packages/game/src/input/input-state.ts`

- **Área:** Game / Input
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de input **Input State**.
- **Tamanho no snapshot:** 1381 bytes

## 85. 🧪 `packages/game/src/input/keyboard/keyboard-source.test.ts`

- **Área:** Game / Input
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Keyboard Source**.
- **Tamanho no snapshot:** 2276 bytes

## 86. ✅ `packages/game/src/input/keyboard/keyboard-source.ts`

- **Área:** Game / Input
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de input **Keyboard Source**.
- **Tamanho no snapshot:** 1669 bytes

## 87. ✅ `packages/game/src/input/keyboard/keyboard.ts`

- **Área:** Game / Input
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de input **Keyboard**.
- **Tamanho no snapshot:** 1000 bytes

## 88. 🧪 `packages/game/src/input/pointer/pointer-look-source.test.ts`

- **Área:** Game / Input
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Pointer Look Source**.
- **Tamanho no snapshot:** 2705 bytes

## 89. ✅ `packages/game/src/input/pointer/pointer-look-source.ts`

- **Área:** Game / Input
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de input **Pointer Look Source**.
- **Tamanho no snapshot:** 1955 bytes

## 90. 🧪 `packages/game/src/input/touch/touch-input-source.test.ts`

- **Área:** Game / Input
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Touch Input Source**.
- **Tamanho no snapshot:** 2152 bytes

## 91. ✅ `packages/game/src/input/touch/touch-input-source.ts`

- **Área:** Game / Input
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de input **Touch Input Source**.
- **Tamanho no snapshot:** 2401 bytes

## 92. ✅ `packages/game/src/interfaces/collider.interface.ts`

- **Área:** Game / Runtime
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Collider Interface**.
- **Tamanho no snapshot:** 1501 bytes

## 93. ✅ `packages/game/src/interfaces/config.interface.ts`

- **Área:** Game / Runtime
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Configuração **Config Interface**.
- **Tamanho no snapshot:** 14692 bytes

## 94. ✅ `packages/game/src/interfaces/world-adapter.interface.ts`

- **Área:** Game / Runtime
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **World Adapter Interface**.
- **Tamanho no snapshot:** 5630 bytes

## 95. ✅ `packages/game/src/mods/mod.interface.ts`

- **Área:** Game / Mods
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Mod Interface**.
- **Tamanho no snapshot:** 1509 bytes

## 96. 🧪 `packages/game/src/mods/wind-mode.test.ts`

- **Área:** Game / Mods
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Wind Mode**.
- **Tamanho no snapshot:** 870 bytes

## 97. ✅ `packages/game/src/mods/wind-mode.ts`

- **Área:** Game / Mods
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Wind Mode**.
- **Tamanho no snapshot:** 6380 bytes

## 98. 🧪 `packages/game/src/mods/wind.mod.test.ts`

- **Área:** Game / Mods
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Wind Mod**.
- **Tamanho no snapshot:** 4617 bytes

## 99. ✅ `packages/game/src/mods/wind.mod.ts`

- **Área:** Game / Mods
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Wind Mod**.
- **Tamanho no snapshot:** 4611 bytes

## 100. 🧪 `packages/game/src/physics/physics-world.test.ts`

- **Área:** Game / Physics
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Physics World**.
- **Tamanho no snapshot:** 7047 bytes

## 101. ✅ `packages/game/src/physics/physics-world.ts`

- **Área:** Game / Physics
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura/função de física **Physics World**.
- **Tamanho no snapshot:** 26683 bytes

## 102. 🧪 `packages/game/src/physics/physics.system.test.ts`

- **Área:** Game / Physics
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Physics System**.
- **Tamanho no snapshot:** 4691 bytes

## 103. ✅ `packages/game/src/physics/physics.system.ts`

- **Área:** Game / Physics
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Physics System**.
- **Tamanho no snapshot:** 1473 bytes

## 104. 🧪 `packages/game/src/physics/rapier.test.ts`

- **Área:** Game / Physics
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Rapier**.
- **Tamanho no snapshot:** 470 bytes

## 105. ✅ `packages/game/src/physics/rapier.ts`

- **Área:** Game / Physics
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura/função de física **Rapier**.
- **Tamanho no snapshot:** 884 bytes

## 106. ✅ `packages/game/src/plugins/ambient-light.plugin.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Plugin de runtime/gráficos **Ambient Light Plugin**.
- **Tamanho no snapshot:** 476 bytes

## 107. 🧪 `packages/game/src/plugins/cloud-profile.test.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Cloud Profile**.
- **Tamanho no snapshot:** 1368 bytes

## 108. ✅ `packages/game/src/plugins/cloud-profile.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Cloud Profile**.
- **Tamanho no snapshot:** 2122 bytes

## 109. ✅ `packages/game/src/plugins/directional-light.plugin.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Plugin de runtime/gráficos **Directional Light Plugin**.
- **Tamanho no snapshot:** 538 bytes

## 110. 🧪 `packages/game/src/plugins/fog.plugin.test.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Fog Plugin**.
- **Tamanho no snapshot:** 2486 bytes

## 111. ✅ `packages/game/src/plugins/fog.plugin.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Plugin de runtime/gráficos **Fog Plugin**.
- **Tamanho no snapshot:** 2478 bytes

## 112. ✅ `packages/game/src/plugins/plugin.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Plugin**.
- **Tamanho no snapshot:** 1387 bytes

## 113. ✅ `packages/game/src/plugins/postfx.plugin.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Plugin de runtime/gráficos **Postfx Plugin**.
- **Tamanho no snapshot:** 8007 bytes

## 114. 🧪 `packages/game/src/plugins/render-pipeline.test.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Render Pipeline**.
- **Tamanho no snapshot:** 2326 bytes

## 115. ✅ `packages/game/src/plugins/render-pipeline.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Render Pipeline**.
- **Tamanho no snapshot:** 1152 bytes

## 116. ✅ `packages/game/src/plugins/sky.plugin.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Plugin de runtime/gráficos **Sky Plugin**.
- **Tamanho no snapshot:** 26016 bytes

## 117. 🧪 `packages/game/src/plugins/sun-position.test.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Sun Position**.
- **Tamanho no snapshot:** 2679 bytes

## 118. ✅ `packages/game/src/plugins/sun-position.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Sun Position**.
- **Tamanho no snapshot:** 1327 bytes

## 119. 🧪 `packages/game/src/plugins/vehicle-reflection/presets.test.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Presets**.
- **Tamanho no snapshot:** 1634 bytes

## 120. ✅ `packages/game/src/plugins/vehicle-reflection/presets.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Presets**.
- **Tamanho no snapshot:** 2969 bytes

## 121. ✅ `packages/game/src/plugins/vehicle-reflection/vehicle-reflection.plugin.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Plugin de runtime/gráficos **Vehicle Reflection Plugin**.
- **Tamanho no snapshot:** 7243 bytes

## 122. ✅ `packages/game/src/plugins/water.plugin.ts`

- **Área:** Game / Graphics plugins
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Plugin de runtime/gráficos **Water Plugin**.
- **Tamanho no snapshot:** 6882 bytes

## 123. 🧪 `packages/game/src/streaming/collision-streaming.system.test.ts`

- **Área:** Game / Streaming
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Collision Streaming System**.
- **Tamanho no snapshot:** 7913 bytes

## 124. ✅ `packages/game/src/streaming/collision-streaming.system.ts`

- **Área:** Game / Streaming
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Collision Streaming System**.
- **Tamanho no snapshot:** 5337 bytes

## 125. 🧪 `packages/game/src/streaming/fade.test.ts`

- **Área:** Game / Streaming
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Fade**.
- **Tamanho no snapshot:** 2399 bytes

## 126. ✅ `packages/game/src/streaming/fade.ts`

- **Área:** Game / Streaming
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Fade**.
- **Tamanho no snapshot:** 3314 bytes

## 127. 🧪 `packages/game/src/streaming/grid.test.ts`

- **Área:** Game / Streaming
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Grid**.
- **Tamanho no snapshot:** 1532 bytes

## 128. ✅ `packages/game/src/streaming/grid.ts`

- **Área:** Game / Streaming
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Grid**.
- **Tamanho no snapshot:** 1993 bytes

## 129. 🧪 `packages/game/src/streaming/streaming.system.test.ts`

- **Área:** Game / Streaming
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Streaming System**.
- **Tamanho no snapshot:** 8566 bytes

## 130. ✅ `packages/game/src/streaming/streaming.system.ts`

- **Área:** Game / Streaming
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Streaming System**.
- **Tamanho no snapshot:** 6971 bytes

## 131. 🧪 `packages/game/src/time/game-clock.test.ts`

- **Área:** Game / Time
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Game Clock**.
- **Tamanho no snapshot:** 1510 bytes

## 132. ✅ `packages/game/src/time/game-clock.ts`

- **Área:** Game / Time
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Game Clock**.
- **Tamanho no snapshot:** 1791 bytes

## 133. 🧪 `packages/game/src/time/hour-window.test.ts`

- **Área:** Game / Time
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Hour Window**.
- **Tamanho no snapshot:** 1625 bytes

## 134. ✅ `packages/game/src/time/hour-window.ts`

- **Área:** Game / Time
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Hour Window**.
- **Tamanho no snapshot:** 1977 bytes

## 135. 🧪 `packages/game/src/time/timed-object.system.test.ts`

- **Área:** Game / Time
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Timed Object System**.
- **Tamanho no snapshot:** 1999 bytes

## 136. ✅ `packages/game/src/time/timed-object.system.ts`

- **Área:** Game / Time
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Timed Object System**.
- **Tamanho no snapshot:** 1278 bytes

## 137. 🧪 `packages/game/src/vehicle/enter-vehicle.system.test.ts`

- **Área:** Game / Vehicles
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Enter Vehicle System**.
- **Tamanho no snapshot:** 16650 bytes

## 138. ✅ `packages/game/src/vehicle/enter-vehicle.system.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Enter Vehicle System**.
- **Tamanho no snapshot:** 29445 bytes

## 139. 🧪 `packages/game/src/vehicle/vehicle-damage.system.test.ts`

- **Área:** Game / Vehicles
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Vehicle Damage System**.
- **Tamanho no snapshot:** 4426 bytes

## 140. ✅ `packages/game/src/vehicle/vehicle-damage.system.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Vehicle Damage System**.
- **Tamanho no snapshot:** 5930 bytes

## 141. 🧪 `packages/game/src/vehicle/vehicle-door.test.ts`

- **Área:** Game / Vehicles
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Vehicle Door**.
- **Tamanho no snapshot:** 1394 bytes

## 142. ✅ `packages/game/src/vehicle/vehicle-door.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Vehicle Door**.
- **Tamanho no snapshot:** 772 bytes

## 143. ✅ `packages/game/src/vehicle/vehicle-headlight.system.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Vehicle Headlight System**.
- **Tamanho no snapshot:** 8195 bytes

## 144. 🧪 `packages/game/src/vehicle/vehicle-lod.system.test.ts`

- **Área:** Game / Vehicles
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Vehicle Lod System**.
- **Tamanho no snapshot:** 3877 bytes

## 145. ✅ `packages/game/src/vehicle/vehicle-lod.system.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Vehicle Lod System**.
- **Tamanho no snapshot:** 4721 bytes

## 146. 🧪 `packages/game/src/vehicle/vehicle-models.test.ts`

- **Área:** Game / Vehicles
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Vehicle Models**.
- **Tamanho no snapshot:** 989 bytes

## 147. ✅ `packages/game/src/vehicle/vehicle-models.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Vehicle Models**.
- **Tamanho no snapshot:** 608 bytes

## 148. ✅ `packages/game/src/vehicle/vehicle-part.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Vehicle Part**.
- **Tamanho no snapshot:** 621 bytes

## 149. 🧪 `packages/game/src/vehicle/vehicle-physics.system.test.ts`

- **Área:** Game / Vehicles
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Vehicle Physics System**.
- **Tamanho no snapshot:** 4289 bytes

## 150. ✅ `packages/game/src/vehicle/vehicle-physics.system.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Vehicle Physics System**.
- **Tamanho no snapshot:** 3371 bytes

## 151. 🧪 `packages/game/src/vehicle/vehicle-rig.test.ts`

- **Área:** Game / Vehicles
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Vehicle Rig**.
- **Tamanho no snapshot:** 2088 bytes

## 152. ✅ `packages/game/src/vehicle/vehicle-rig.ts`

- **Área:** Game / Vehicles
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Vehicle Rig**.
- **Tamanho no snapshot:** 1967 bytes

## 153. 🧪 `packages/game/src/weather/weather-transition.test.ts`

- **Área:** Game / Weather
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Weather Transition**.
- **Tamanho no snapshot:** 2450 bytes

## 154. ✅ `packages/game/src/weather/weather-transition.ts`

- **Área:** Game / Weather
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Weather Transition**.
- **Tamanho no snapshot:** 2220 bytes

## 155. 🧪 `packages/game/src/weather/weather-zones.test.ts`

- **Área:** Game / Weather
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Weather Zones**.
- **Tamanho no snapshot:** 3181 bytes

## 156. ✅ `packages/game/src/weather/weather-zones.ts`

- **Área:** Game / Weather
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Weather Zones**.
- **Tamanho no snapshot:** 2003 bytes

## 157. 🧪 `packages/game/src/zones/city-zone.system.test.ts`

- **Área:** Game / Zones
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **City Zone System**.
- **Tamanho no snapshot:** 1591 bytes

## 158. ✅ `packages/game/src/zones/city-zone.system.ts`

- **Área:** Game / Zones
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **City Zone System**.
- **Tamanho no snapshot:** 1233 bytes

## 159. 🧪 `packages/game/src/zones/city.test.ts`

- **Área:** Game / Zones
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **City**.
- **Tamanho no snapshot:** 2775 bytes

## 160. ✅ `packages/game/src/zones/city.ts`

- **Área:** Game / Zones
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **City**.
- **Tamanho no snapshot:** 2091 bytes

## 161. 🧪 `packages/game/src/zones/zone-name.system.test.ts`

- **Área:** Game / Zones
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Zone Name System**.
- **Tamanho no snapshot:** 1896 bytes

## 162. ✅ `packages/game/src/zones/zone-name.system.ts`

- **Área:** Game / Zones
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Sistema de runtime **Zone Name System**.
- **Tamanho no snapshot:** 1782 bytes

## 163. ✅ `packages/loaders/src/asset-fetch-loader/asset-fetch-loader.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Asset Fetch Loader**.
- **Tamanho no snapshot:** 8913 bytes

## 164. 🧪 `packages/loaders/src/asset-fetch-loader/cache-store.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Cache Store**.
- **Tamanho no snapshot:** 1046 bytes

## 165. ✅ `packages/loaders/src/asset-fetch-loader/cache-store.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Cache Store**.
- **Tamanho no snapshot:** 2310 bytes

## 166. ✅ `packages/loaders/src/asset-fetch-loader/index.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Index**.
- **Tamanho no snapshot:** 169 bytes

## 167. 🧪 `packages/loaders/src/asset-fetch-loader/invalidate.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Invalidate**.
- **Tamanho no snapshot:** 660 bytes

## 168. ✅ `packages/loaders/src/asset-fetch-loader/invalidate.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Invalidate**.
- **Tamanho no snapshot:** 550 bytes

## 169. 🧪 `packages/loaders/src/asset-local-loader/asset-local-loader.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Asset Local Loader**.
- **Tamanho no snapshot:** 5450 bytes

## 170. ✅ `packages/loaders/src/asset-local-loader/asset-local-loader.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Asset Local Loader**.
- **Tamanho no snapshot:** 7843 bytes

## 171. 🧪 `packages/loaders/src/asset-local-loader/build-vfs.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Vfs**.
- **Tamanho no snapshot:** 4265 bytes

## 172. ✅ `packages/loaders/src/asset-local-loader/build-vfs.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Vfs**.
- **Tamanho no snapshot:** 6740 bytes

## 173. 🧪 `packages/loaders/src/asset-local-loader/dir-handle-store.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Dir Handle Store**.
- **Tamanho no snapshot:** 3529 bytes

## 174. ✅ `packages/loaders/src/asset-local-loader/dir-handle-store.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Dir Handle Store**.
- **Tamanho no snapshot:** 6563 bytes

## 175. ✅ `packages/loaders/src/asset-local-loader/file-system-access.d.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **File System Access D**.
- **Tamanho no snapshot:** 814 bytes

## 176. 🧪 `packages/loaders/src/asset-local-loader/img-reader.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Img Reader**.
- **Tamanho no snapshot:** 3540 bytes

## 177. ✅ `packages/loaders/src/asset-local-loader/img-reader.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Img Reader**.
- **Tamanho no snapshot:** 2524 bytes

## 178. ✅ `packages/loaders/src/asset-local-loader/index.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Index**.
- **Tamanho no snapshot:** 190 bytes

## 179. ✅ `packages/loaders/src/asset-local-loader/install-source.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Install Source**.
- **Tamanho no snapshot:** 2509 bytes

## 180. 🧪 `packages/loaders/src/emitter.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Emitter**.
- **Tamanho no snapshot:** 2144 bytes

## 181. ✅ `packages/loaders/src/emitter.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Emitter**.
- **Tamanho no snapshot:** 1236 bytes

## 182. ✅ `packages/loaders/src/index.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Index**.
- **Tamanho no snapshot:** 2293 bytes

## 183. 🧪 `packages/loaders/src/manifest.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Manifest**.
- **Tamanho no snapshot:** 3992 bytes

## 184. ✅ `packages/loaders/src/manifest.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Manifest**.
- **Tamanho no snapshot:** 2949 bytes

## 185. 🧪 `packages/loaders/src/progress.test.ts`

- **Área:** Asset loaders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Progress**.
- **Tamanho no snapshot:** 1506 bytes

## 186. ✅ `packages/loaders/src/progress.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Progress**.
- **Tamanho no snapshot:** 1625 bytes

## 187. ✅ `packages/loaders/src/types.ts`

- **Área:** Asset loaders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de carregamento **Types**.
- **Tamanho no snapshot:** 4280 bytes

## 188. 🧪 `packages/renderware/src/archive/asset-cache.test.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Asset Cache**.
- **Tamanho no snapshot:** 3376 bytes

## 189. ✅ `packages/renderware/src/archive/asset-cache.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de archive/cache **Asset Cache**.
- **Tamanho no snapshot:** 4786 bytes

## 190. ✅ `packages/renderware/src/archive/asset-fs.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de archive/cache **Asset Fs**.
- **Tamanho no snapshot:** 744 bytes

## 191. 🧪 `packages/renderware/src/archive/img-archive.fixture.test.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Img Archive Fixture**.
- **Tamanho no snapshot:** 1807 bytes

## 192. 🧪 `packages/renderware/src/archive/img-archive.test.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Img Archive**.
- **Tamanho no snapshot:** 2973 bytes

## 193. ✅ `packages/renderware/src/archive/img-archive.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de archive/cache **Img Archive**.
- **Tamanho no snapshot:** 8302 bytes

## 194. ✅ `packages/renderware/src/archive/index.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de archive/cache **Index**.
- **Tamanho no snapshot:** 634 bytes

## 195. 🧪 `packages/renderware/src/archive/model-key.test.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Model Key**.
- **Tamanho no snapshot:** 726 bytes

## 196. ✅ `packages/renderware/src/archive/model-key.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de archive/cache **Model Key**.
- **Tamanho no snapshot:** 372 bytes

## 197. 🧪 `packages/renderware/src/archive/resolve-paths.test.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Resolve Paths**.
- **Tamanho no snapshot:** 1445 bytes

## 198. ✅ `packages/renderware/src/archive/resolve-paths.ts`

- **Área:** RenderWare / Archives
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Infraestrutura de archive/cache **Resolve Paths**.
- **Tamanho no snapshot:** 1310 bytes

## 199. 🧪 `packages/renderware/src/collision/build-cell-colliders.test.ts`

- **Área:** RenderWare / Collision
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Cell Colliders**.
- **Tamanho no snapshot:** 2735 bytes

## 200. ✅ `packages/renderware/src/collision/build-cell-colliders.ts`

- **Área:** RenderWare / Collision
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Cell Colliders**.
- **Tamanho no snapshot:** 1180 bytes

## 201. 🧪 `packages/renderware/src/collision/build-colliders.test.ts`

- **Área:** RenderWare / Collision
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Colliders**.
- **Tamanho no snapshot:** 4989 bytes

## 202. ✅ `packages/renderware/src/collision/build-colliders.ts`

- **Área:** RenderWare / Collision
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Colliders**.
- **Tamanho no snapshot:** 3946 bytes

## 203. 🧪 `packages/renderware/src/collision/collision-index.test.ts`

- **Área:** RenderWare / Collision
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Collision Index**.
- **Tamanho no snapshot:** 3576 bytes

## 204. ✅ `packages/renderware/src/collision/collision-index.ts`

- **Área:** RenderWare / Collision
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Entry point/reexports do módulo **Collision Index**.
- **Tamanho no snapshot:** 1996 bytes

## 205. ✅ `packages/renderware/src/collision/index.ts`

- **Área:** RenderWare / Collision
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Entry point/reexports do módulo **Index**.
- **Tamanho no snapshot:** 413 bytes

## 206. 🧪 `packages/renderware/src/index.test.ts`

- **Área:** RenderWare
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Index**.
- **Tamanho no snapshot:** 1448 bytes

## 207. ✅ `packages/renderware/src/index.ts`

- **Área:** RenderWare
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Entry point/reexports do módulo **Index**.
- **Tamanho no snapshot:** 2956 bytes

## 208. 🧪 `packages/renderware/src/map/build-animated-objects.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Animated Objects**.
- **Tamanho no snapshot:** 4361 bytes

## 209. 🧪 `packages/renderware/src/map/build-cell.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Cell**.
- **Tamanho no snapshot:** 2452 bytes

## 210. ✅ `packages/renderware/src/map/build-cell.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Cell**.
- **Tamanho no snapshot:** 3408 bytes

## 211. 🧪 `packages/renderware/src/map/build-procobj.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Procobj**.
- **Tamanho no snapshot:** 5181 bytes

## 212. ✅ `packages/renderware/src/map/build-procobj.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Procobj**.
- **Tamanho no snapshot:** 3953 bytes

## 213. 🧪 `packages/renderware/src/map/build-region.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Region**.
- **Tamanho no snapshot:** 8556 bytes

## 214. ✅ `packages/renderware/src/map/build-region.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Region**.
- **Tamanho no snapshot:** 19096 bytes

## 215. ✅ `packages/renderware/src/map/index.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Entry point/reexports do módulo **Index**.
- **Tamanho no snapshot:** 827 bytes

## 216. 🧪 `packages/renderware/src/map/procobj-categories.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Procobj Categories**.
- **Tamanho no snapshot:** 2005 bytes

## 217. ✅ `packages/renderware/src/map/procobj-categories.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Procobj Categories**.
- **Tamanho no snapshot:** 2561 bytes

## 218. 🧪 `packages/renderware/src/map/procobj-colliders.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Procobj Colliders**.
- **Tamanho no snapshot:** 4051 bytes

## 219. ✅ `packages/renderware/src/map/procobj-colliders.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Procobj Colliders**.
- **Tamanho no snapshot:** 2347 bytes

## 220. 🧪 `packages/renderware/src/map/procobj-runtime.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Procobj Runtime**.
- **Tamanho no snapshot:** 3946 bytes

## 221. ✅ `packages/renderware/src/map/procobj-runtime.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Procobj Runtime**.
- **Tamanho no snapshot:** 3219 bytes

## 222. 🧪 `packages/renderware/src/map/procobj-scatter.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Procobj Scatter**.
- **Tamanho no snapshot:** 8431 bytes

## 223. ✅ `packages/renderware/src/map/procobj-scatter.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Procobj Scatter**.
- **Tamanho no snapshot:** 8749 bytes

## 224. 🧪 `packages/renderware/src/map/resolve-map.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Resolve Map**.
- **Tamanho no snapshot:** 3613 bytes

## 225. ✅ `packages/renderware/src/map/resolve-map.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Resolve Map**.
- **Tamanho no snapshot:** 3510 bytes

## 226. 🧪 `packages/renderware/src/map/world-grid.test.ts`

- **Área:** RenderWare / Map
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **World Grid**.
- **Tamanho no snapshot:** 2548 bytes

## 227. ✅ `packages/renderware/src/map/world-grid.ts`

- **Área:** RenderWare / Map
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **World Grid**.
- **Tamanho no snapshot:** 2017 bytes

## 228. 🧪 `packages/renderware/src/parsers/binary/binary-stream.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Binary Stream**.
- **Tamanho no snapshot:** 2349 bytes

## 229. ✅ `packages/renderware/src/parsers/binary/binary-stream.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Binary Stream**.
- **Tamanho no snapshot:** 2780 bytes

## 230. 🧪 `packages/renderware/src/parsers/binary/breakable.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Breakable**.
- **Tamanho no snapshot:** 4029 bytes

## 231. 🧪 `packages/renderware/src/parsers/binary/chunks.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Chunks**.
- **Tamanho no snapshot:** 2583 bytes

## 232. ✅ `packages/renderware/src/parsers/binary/chunks.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Chunks**.
- **Tamanho no snapshot:** 7941 bytes

## 233. ✅ `packages/renderware/src/parsers/binary/col-types.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Col Types**.
- **Tamanho no snapshot:** 1437 bytes

## 234. 🧪 `packages/renderware/src/parsers/binary/col.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Col**.
- **Tamanho no snapshot:** 10264 bytes

## 235. ✅ `packages/renderware/src/parsers/binary/col.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Col**.
- **Tamanho no snapshot:** 6286 bytes

## 236. ✅ `packages/renderware/src/parsers/binary/constants.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Constants**.
- **Tamanho no snapshot:** 2842 bytes

## 237. 🧪 `packages/renderware/src/parsers/binary/dff.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Dff**.
- **Tamanho no snapshot:** 19970 bytes

## 238. ✅ `packages/renderware/src/parsers/binary/dff.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Dff**.
- **Tamanho no snapshot:** 29927 bytes

## 239. 🧪 `packages/renderware/src/parsers/binary/escalator.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Escalator**.
- **Tamanho no snapshot:** 2418 bytes

## 240. 🧪 `packages/renderware/src/parsers/binary/gxt.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Gxt**.
- **Tamanho no snapshot:** 2217 bytes

## 241. ✅ `packages/renderware/src/parsers/binary/gxt.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Gxt**.
- **Tamanho no snapshot:** 3576 bytes

## 242. 🧪 `packages/renderware/src/parsers/binary/ifp.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Ifp**.
- **Tamanho no snapshot:** 2506 bytes

## 243. ✅ `packages/renderware/src/parsers/binary/ifp.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Ifp**.
- **Tamanho no snapshot:** 3346 bytes

## 244. 🧪 `packages/renderware/src/parsers/binary/night-colors.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Night Colors**.
- **Tamanho no snapshot:** 3805 bytes

## 245. 🧪 `packages/renderware/src/parsers/binary/particle.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Particle**.
- **Tamanho no snapshot:** 1672 bytes

## 246. 🧪 `packages/renderware/src/parsers/binary/roadsign.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Roadsign**.
- **Tamanho no snapshot:** 3468 bytes

## 247. 🧪 `packages/renderware/src/parsers/binary/txd.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Txd**.
- **Tamanho no snapshot:** 10321 bytes

## 248. ✅ `packages/renderware/src/parsers/binary/txd.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Txd**.
- **Tamanho no snapshot:** 11932 bytes

## 249. ✅ `packages/renderware/src/parsers/binary/types.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Types**.
- **Tamanho no snapshot:** 10263 bytes

## 250. 🧪 `packages/renderware/src/parsers/binary/uv-anim.test.ts`

- **Área:** RenderWare / Binary parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Uv Anim**.
- **Tamanho no snapshot:** 4559 bytes

## 251. 🧪 `packages/renderware/src/parsers/text/carcols.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Carcols Parser**.
- **Tamanho no snapshot:** 1927 bytes

## 252. ✅ `packages/renderware/src/parsers/text/carcols.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Carcols Parser**.
- **Tamanho no snapshot:** 2554 bytes

## 253. 🧪 `packages/renderware/src/parsers/text/fxp.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Fxp Parser**.
- **Tamanho no snapshot:** 3942 bytes

## 254. ✅ `packages/renderware/src/parsers/text/fxp.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Fxp Parser**.
- **Tamanho no snapshot:** 7600 bytes

## 255. 🧪 `packages/renderware/src/parsers/text/gta-dat.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Gta Dat Parser**.
- **Tamanho no snapshot:** 1669 bytes

## 256. ✅ `packages/renderware/src/parsers/text/gta-dat.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Gta Dat Parser**.
- **Tamanho no snapshot:** 1089 bytes

## 257. 🧪 `packages/renderware/src/parsers/text/handling.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Handling Parser**.
- **Tamanho no snapshot:** 1417 bytes

## 258. ✅ `packages/renderware/src/parsers/text/handling.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Handling Parser**.
- **Tamanho no snapshot:** 1081 bytes

## 259. 🧪 `packages/renderware/src/parsers/text/ide-flags.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Ide Flags**.
- **Tamanho no snapshot:** 1496 bytes

## 260. ✅ `packages/renderware/src/parsers/text/ide-flags.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Ide Flags**.
- **Tamanho no snapshot:** 1337 bytes

## 261. 🧪 `packages/renderware/src/parsers/text/ide.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Ide Parser**.
- **Tamanho no snapshot:** 4886 bytes

## 262. ✅ `packages/renderware/src/parsers/text/ide.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Ide Parser**.
- **Tamanho no snapshot:** 3661 bytes

## 263. ✅ `packages/renderware/src/parsers/text/index.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Index**.
- **Tamanho no snapshot:** 1420 bytes

## 264. 🧪 `packages/renderware/src/parsers/text/interior.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Interior**.
- **Tamanho no snapshot:** 1194 bytes

## 265. ✅ `packages/renderware/src/parsers/text/interior.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Interior**.
- **Tamanho no snapshot:** 1456 bytes

## 266. 🧪 `packages/renderware/src/parsers/text/ipl-binary.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Ipl Binary Parser**.
- **Tamanho no snapshot:** 2570 bytes

## 267. ✅ `packages/renderware/src/parsers/text/ipl-binary.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Ipl Binary Parser**.
- **Tamanho no snapshot:** 1756 bytes

## 268. 🧪 `packages/renderware/src/parsers/text/ipl.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Ipl Parser**.
- **Tamanho no snapshot:** 1606 bytes

## 269. ✅ `packages/renderware/src/parsers/text/ipl.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Ipl Parser**.
- **Tamanho no snapshot:** 1171 bytes

## 270. 🧪 `packages/renderware/src/parsers/text/lod.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Lod**.
- **Tamanho no snapshot:** 592 bytes

## 271. ✅ `packages/renderware/src/parsers/text/lod.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Lod**.
- **Tamanho no snapshot:** 369 bytes

## 272. 🧪 `packages/renderware/src/parsers/text/object-dat.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Object Dat Parser**.
- **Tamanho no snapshot:** 2049 bytes

## 273. ✅ `packages/renderware/src/parsers/text/object-dat.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Object Dat Parser**.
- **Tamanho no snapshot:** 2717 bytes

## 274. 🧪 `packages/renderware/src/parsers/text/ped-defs.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Ped Defs Parser**.
- **Tamanho no snapshot:** 1056 bytes

## 275. ✅ `packages/renderware/src/parsers/text/ped-defs.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Ped Defs Parser**.
- **Tamanho no snapshot:** 935 bytes

## 276. 🧪 `packages/renderware/src/parsers/text/procobj.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Procobj Parser**.
- **Tamanho no snapshot:** 2705 bytes

## 277. ✅ `packages/renderware/src/parsers/text/procobj.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Procobj Parser**.
- **Tamanho no snapshot:** 2379 bytes

## 278. 🧪 `packages/renderware/src/parsers/text/surfinfo.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Surfinfo Parser**.
- **Tamanho no snapshot:** 1300 bytes

## 279. ✅ `packages/renderware/src/parsers/text/surfinfo.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Surfinfo Parser**.
- **Tamanho no snapshot:** 650 bytes

## 280. 🧪 `packages/renderware/src/parsers/text/text-lines.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Text Lines**.
- **Tamanho no snapshot:** 1492 bytes

## 281. ✅ `packages/renderware/src/parsers/text/text-lines.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Text Lines**.
- **Tamanho no snapshot:** 1112 bytes

## 282. 🧪 `packages/renderware/src/parsers/text/timecyc.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Timecyc Parser**.
- **Tamanho no snapshot:** 5418 bytes

## 283. ✅ `packages/renderware/src/parsers/text/timecyc.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Timecyc Parser**.
- **Tamanho no snapshot:** 9768 bytes

## 284. 🧪 `packages/renderware/src/parsers/text/timecyc.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Timecyc**.
- **Tamanho no snapshot:** 1480 bytes

## 285. ✅ `packages/renderware/src/parsers/text/timecyc.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Timecyc**.
- **Tamanho no snapshot:** 4533 bytes

## 286. ✅ `packages/renderware/src/parsers/text/types.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Types**.
- **Tamanho no snapshot:** 2223 bytes

## 287. 🧪 `packages/renderware/src/parsers/text/vehicle-defs.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Vehicle Defs Parser**.
- **Tamanho no snapshot:** 1609 bytes

## 288. ✅ `packages/renderware/src/parsers/text/vehicle-defs.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Vehicle Defs Parser**.
- **Tamanho no snapshot:** 1538 bytes

## 289. 🧪 `packages/renderware/src/parsers/text/water.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Water Parser**.
- **Tamanho no snapshot:** 2008 bytes

## 290. ✅ `packages/renderware/src/parsers/text/water.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Water Parser**.
- **Tamanho no snapshot:** 1453 bytes

## 291. 🧪 `packages/renderware/src/parsers/text/zon.parser.test.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Zon Parser**.
- **Tamanho no snapshot:** 1839 bytes

## 292. ✅ `packages/renderware/src/parsers/text/zon.parser.ts`

- **Área:** RenderWare / Text parsers
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Parser de dados/formato para **Zon Parser**.
- **Tamanho no snapshot:** 1768 bytes

## 293. ✅ `packages/renderware/src/test-utils.ts`

- **Área:** RenderWare
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Test Utils**.
- **Tamanho no snapshot:** 2172 bytes

## 294. 🧪 `packages/renderware/src/three/animated-objects.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Animated Objects**.
- **Tamanho no snapshot:** 1963 bytes

## 295. ✅ `packages/renderware/src/three/animated-objects.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Animated Objects**.
- **Tamanho no snapshot:** 1472 bytes

## 296. 🧪 `packages/renderware/src/three/breakable.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Breakable**.
- **Tamanho no snapshot:** 5998 bytes

## 297. ✅ `packages/renderware/src/three/breakable.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Breakable**.
- **Tamanho no snapshot:** 7463 bytes

## 298. 🧪 `packages/renderware/src/three/build-anim-clip.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Anim Clip**.
- **Tamanho no snapshot:** 1957 bytes

## 299. ✅ `packages/renderware/src/three/build-anim-clip.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Anim Clip**.
- **Tamanho no snapshot:** 2061 bytes

## 300. 🧪 `packages/renderware/src/three/build-animated-clump.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Animated Clump**.
- **Tamanho no snapshot:** 3037 bytes

## 301. ✅ `packages/renderware/src/three/build-animated-clump.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Animated Clump**.
- **Tamanho no snapshot:** 3388 bytes

## 302. 🧪 `packages/renderware/src/three/build-clump-parts.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Clump Parts**.
- **Tamanho no snapshot:** 5266 bytes

## 303. 🧪 `packages/renderware/src/three/build-clump.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Clump**.
- **Tamanho no snapshot:** 11318 bytes

## 304. ✅ `packages/renderware/src/three/build-clump.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Clump**.
- **Tamanho no snapshot:** 22371 bytes

## 305. 🧪 `packages/renderware/src/three/build-col-wireframe.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Col Wireframe**.
- **Tamanho no snapshot:** 5289 bytes

## 306. ✅ `packages/renderware/src/three/build-col-wireframe.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Col Wireframe**.
- **Tamanho no snapshot:** 3759 bytes

## 307. 🧪 `packages/renderware/src/three/build-debris.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Debris**.
- **Tamanho no snapshot:** 5706 bytes

## 308. ✅ `packages/renderware/src/three/build-debris.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Debris**.
- **Tamanho no snapshot:** 12050 bytes

## 309. 🧪 `packages/renderware/src/three/build-escalator.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Escalator**.
- **Tamanho no snapshot:** 4545 bytes

## 310. ✅ `packages/renderware/src/three/build-escalator.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Escalator**.
- **Tamanho no snapshot:** 6009 bytes

## 311. 🧪 `packages/renderware/src/three/build-particles.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Particles**.
- **Tamanho no snapshot:** 7263 bytes

## 312. ✅ `packages/renderware/src/three/build-particles.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Particles**.
- **Tamanho no snapshot:** 11537 bytes

## 313. 🧪 `packages/renderware/src/three/build-roadsign.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Roadsign**.
- **Tamanho no snapshot:** 5572 bytes

## 314. ✅ `packages/renderware/src/three/build-roadsign.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Roadsign**.
- **Tamanho no snapshot:** 9115 bytes

## 315. 🧪 `packages/renderware/src/three/build-skinned-clump.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Skinned Clump**.
- **Tamanho no snapshot:** 11861 bytes

## 316. ✅ `packages/renderware/src/three/build-skinned-clump.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Skinned Clump**.
- **Tamanho no snapshot:** 8200 bytes

## 317. 🧪 `packages/renderware/src/three/build-texture.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Texture**.
- **Tamanho no snapshot:** 3881 bytes

## 318. ✅ `packages/renderware/src/three/build-texture.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Texture**.
- **Tamanho no snapshot:** 2097 bytes

## 319. 🧪 `packages/renderware/src/three/build-vehicle.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Vehicle**.
- **Tamanho no snapshot:** 32514 bytes

## 320. ✅ `packages/renderware/src/three/build-vehicle.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Vehicle**.
- **Tamanho no snapshot:** 37439 bytes

## 321. 🧪 `packages/renderware/src/three/build-water.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build Water**.
- **Tamanho no snapshot:** 3699 bytes

## 322. ✅ `packages/renderware/src/three/build-water.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Builder/conversor de runtime para **Build Water**.
- **Tamanho no snapshot:** 3670 bytes

## 323. 🧪 `packages/renderware/src/three/corona.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Corona**.
- **Tamanho no snapshot:** 2198 bytes

## 324. ✅ `packages/renderware/src/three/corona.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Corona**.
- **Tamanho no snapshot:** 5260 bytes

## 325. 🧪 `packages/renderware/src/three/night-fill.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Night Fill**.
- **Tamanho no snapshot:** 2961 bytes

## 326. ✅ `packages/renderware/src/three/night-fill.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Night Fill**.
- **Tamanho no snapshot:** 3308 bytes

## 327. 🧪 `packages/renderware/src/three/uv-anim.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Uv Anim**.
- **Tamanho no snapshot:** 5319 bytes

## 328. ✅ `packages/renderware/src/three/uv-anim.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Uv Anim**.
- **Tamanho no snapshot:** 4696 bytes

## 329. 🧪 `packages/renderware/src/three/world-material.test.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **World Material**.
- **Tamanho no snapshot:** 9114 bytes

## 330. ✅ `packages/renderware/src/three/world-material.ts`

- **Área:** RenderWare / Three builders
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **World Material**.
- **Tamanho no snapshot:** 11467 bytes

## 331. ✅ `packages/vfs/src/index.ts`

- **Área:** VFS
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Entry point/reexports do módulo **Index**.
- **Tamanho no snapshot:** 277 bytes

## 332. 🧪 `packages/vfs/src/verify.test.ts`

- **Área:** VFS
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Verify**.
- **Tamanho no snapshot:** 1499 bytes

## 333. ✅ `packages/vfs/src/verify.ts`

- **Área:** VFS
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Verify**.
- **Tamanho no snapshot:** 1115 bytes

## 334. 🧪 `packages/vfs/src/vfs.test.ts`

- **Área:** VFS
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Vfs**.
- **Tamanho no snapshot:** 4068 bytes

## 335. ✅ `packages/vfs/src/vfs.ts`

- **Área:** VFS
- **Tipo:** Código de runtime/biblioteca
- **Descrição:** Implementação de **Vfs**.
- **Tamanho no snapshot:** 2594 bytes

## 336. 🛠️ `playwright.config.ts`

- **Área:** Config / Tooling
- **Tipo:** Tooling/configuração
- **Descrição:** Configuração **Playwright Config**.
- **Tamanho no snapshot:** 1718 bytes

## 337. 🛠️ `scripts/build-game.ts`

- **Área:** Build scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Builder/conversor de runtime para **Build Game**.
- **Tamanho no snapshot:** 14410 bytes

## 338. 🛠️ `scripts/build-viewer-assets.ts`

- **Área:** Build scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Builder/conversor de runtime para **Build Viewer Assets**.
- **Tamanho no snapshot:** 4575 bytes

## 339. 🛠️ `scripts/debug/audit-rw-coverage.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Audit Rw Coverage**.
- **Tamanho no snapshot:** 5208 bytes

## 340. 🛠️ `scripts/debug/check-cell-signs.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Check Cell Signs**.
- **Tamanho no snapshot:** 2434 bytes

## 341. 🛠️ `scripts/debug/dump-chunks.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Dump Chunks**.
- **Tamanho no snapshot:** 2369 bytes

## 342. 🛠️ `scripts/debug/dump-fx-system.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Dump Fx System**.
- **Tamanho no snapshot:** 1279 bytes

## 343. 🛠️ `scripts/debug/dump-texture.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Dump Texture**.
- **Tamanho no snapshot:** 7651 bytes

## 344. 🛠️ `scripts/debug/find-2dfx.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Find 2dfx**.
- **Tamanho no snapshot:** 6145 bytes

## 345. 🛠️ `scripts/debug/find-instances.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Find Instances**.
- **Tamanho no snapshot:** 1744 bytes

## 346. 🛠️ `scripts/debug/ide-flag-histogram.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Ide Flag Histogram**.
- **Tamanho no snapshot:** 2335 bytes

## 347. 🛠️ `scripts/debug/inspect-area.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Inspect Area**.
- **Tamanho no snapshot:** 2968 bytes

## 348. 🛠️ `scripts/debug/model-bbox.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Model Bbox**.
- **Tamanho no snapshot:** 3160 bytes

## 349. 🛠️ `scripts/debug/procobj-stats.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Procobj Stats**.
- **Tamanho no snapshot:** 5253 bytes

## 350. 🛠️ `scripts/debug/solve-roadsign.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Solve Roadsign**.
- **Tamanho no snapshot:** 4033 bytes

## 351. 🛠️ `scripts/debug/wind-coverage.ts`

- **Área:** Debug scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Wind Coverage**.
- **Tamanho no snapshot:** 4866 bytes

## 352. 🧪 `scripts/game-build/chunk.test.ts`

- **Área:** Build scripts
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Chunk**.
- **Tamanho no snapshot:** 2612 bytes

## 353. 🛠️ `scripts/game-build/chunk.ts`

- **Área:** Build scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Chunk**.
- **Tamanho no snapshot:** 1917 bytes

## 354. 🛠️ `scripts/gen-wind-list.ts`

- **Área:** Build scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Gen Wind List**.
- **Tamanho no snapshot:** 1289 bytes

## 355. 🛠️ `scripts/lib/game.ts`

- **Área:** Build scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Game**.
- **Tamanho no snapshot:** 5482 bytes

## 356. 🛠️ `scripts/serve-static.ts`

- **Área:** Build scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Serve Static**.
- **Tamanho no snapshot:** 928 bytes

## 357. 🛠️ `scripts/test-fixtures.ts`

- **Área:** Build scripts
- **Tipo:** Tooling/configuração
- **Descrição:** Script de build/diagnóstico **Test Fixtures**.
- **Tamanho no snapshot:** 7077 bytes

## 358. 🧪 `tools/lod-generator/src/adapters/gta-sa/cell-txd.test.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Cell Txd**.
- **Tamanho no snapshot:** 2104 bytes

## 359. 🛠️ `tools/lod-generator/src/adapters/gta-sa/cell-txd.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Cell Txd**.
- **Tamanho no snapshot:** 3286 bytes

## 360. 🛠️ `tools/lod-generator/src/adapters/gta-sa/decimate.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Decimate**.
- **Tamanho no snapshot:** 2778 bytes

## 361. 🧪 `tools/lod-generator/src/adapters/gta-sa/dff.test.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Dff**.
- **Tamanho no snapshot:** 2383 bytes

## 362. 🛠️ `tools/lod-generator/src/adapters/gta-sa/dff.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Dff**.
- **Tamanho no snapshot:** 7770 bytes

## 363. 🧪 `tools/lod-generator/src/adapters/gta-sa/finalize.test.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Finalize**.
- **Tamanho no snapshot:** 902 bytes

## 364. 🛠️ `tools/lod-generator/src/adapters/gta-sa/finalize.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Finalize**.
- **Tamanho no snapshot:** 3623 bytes

## 365. 🛠️ `tools/lod-generator/src/adapters/gta-sa/index.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Index**.
- **Tamanho no snapshot:** 2044 bytes

## 366. 🛠️ `tools/lod-generator/src/adapters/gta-sa/io.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Io**.
- **Tamanho no snapshot:** 649 bytes

## 367. 🧪 `tools/lod-generator/src/adapters/gta-sa/merge.test.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Merge**.
- **Tamanho no snapshot:** 3582 bytes

## 368. 🛠️ `tools/lod-generator/src/adapters/gta-sa/merge.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Merge**.
- **Tamanho no snapshot:** 4713 bytes

## 369. 🛠️ `tools/lod-generator/src/adapters/gta-sa/model-source.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Model Source**.
- **Tamanho no snapshot:** 1712 bytes

## 370. 🛠️ `tools/lod-generator/src/adapters/gta-sa/normals.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Normals**.
- **Tamanho no snapshot:** 1751 bytes

## 371. 🛠️ `tools/lod-generator/src/adapters/gta-sa/resolve.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Resolve**.
- **Tamanho no snapshot:** 3883 bytes

## 372. 🛠️ `tools/lod-generator/src/adapters/gta-sa/texture-source.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Texture Source**.
- **Tamanho no snapshot:** 2955 bytes

## 373. 🛠️ `tools/lod-generator/src/cli.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Cli**.
- **Tamanho no snapshot:** 2016 bytes

## 374. 🛠️ `tools/lod-generator/src/core/adapter.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Adapter**.
- **Tamanho no snapshot:** 1022 bytes

## 375. 🛠️ `tools/lod-generator/src/core/grid.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Grid**.
- **Tamanho no snapshot:** 449 bytes

## 376. 🛠️ `tools/lod-generator/src/core/index.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Index**.
- **Tamanho no snapshot:** 274 bytes

## 377. 🛠️ `tools/lod-generator/src/core/pipeline.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Pipeline**.
- **Tamanho no snapshot:** 1138 bytes

## 378. 🛠️ `tools/lod-generator/src/core/types.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Types**.
- **Tamanho no snapshot:** 3179 bytes

## 379. 🛠️ `tools/lod-generator/src/lod.config.ts`

- **Área:** Tool / LOD generator
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Lod Config**.
- **Tamanho no snapshot:** 485 bytes

## 380. 🧪 `tools/map-optimizer/src/adapters/gta-sa/build.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Build**.
- **Tamanho no snapshot:** 1513 bytes

## 381. 🛠️ `tools/map-optimizer/src/adapters/gta-sa/build.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Build**.
- **Tamanho no snapshot:** 2255 bytes

## 382. 🧪 `tools/map-optimizer/src/adapters/gta-sa/codec/apply-mesh-to-struct.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Apply Mesh To Struct**.
- **Tamanho no snapshot:** 2342 bytes

## 383. 🧪 `tools/map-optimizer/src/adapters/gta-sa/codec/dff.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Dff**.
- **Tamanho no snapshot:** 3496 bytes

## 384. 🛠️ `tools/map-optimizer/src/adapters/gta-sa/codec/dff.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Dff**.
- **Tamanho no snapshot:** 2994 bytes

## 385. 🧪 `tools/map-optimizer/src/adapters/gta-sa/codec/geometry-rebuild.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Geometry Rebuild**.
- **Tamanho no snapshot:** 5080 bytes

## 386. 🛠️ `tools/map-optimizer/src/adapters/gta-sa/codec/geometry-rebuild.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Geometry Rebuild**.
- **Tamanho no snapshot:** 7930 bytes

## 387. 🛠️ `tools/map-optimizer/src/adapters/gta-sa/index.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Index**.
- **Tamanho no snapshot:** 5144 bytes

## 388. 🛠️ `tools/map-optimizer/src/adapters/gta-sa/read.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Read**.
- **Tamanho no snapshot:** 926 bytes

## 389. 🛠️ `tools/map-optimizer/src/adapters/gta-sa/resolve.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Resolve**.
- **Tamanho no snapshot:** 2442 bytes

## 390. 🧪 `tools/map-optimizer/src/adapters/gta-sa/textures.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Textures**.
- **Tamanho no snapshot:** 2538 bytes

## 391. 🛠️ `tools/map-optimizer/src/adapters/gta-sa/textures.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Textures**.
- **Tamanho no snapshot:** 3689 bytes

## 392. 🧪 `tools/map-optimizer/src/analysis/curvature.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Curvature**.
- **Tamanho no snapshot:** 2343 bytes

## 393. 🛠️ `tools/map-optimizer/src/analysis/curvature.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Curvature**.
- **Tamanho no snapshot:** 6525 bytes

## 394. 🛠️ `tools/map-optimizer/src/analyze-curvature.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Analyze Curvature**.
- **Tamanho no snapshot:** 7808 bytes

## 395. 🛠️ `tools/map-optimizer/src/cli.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Cli**.
- **Tamanho no snapshot:** 2677 bytes

## 396. 🛠️ `tools/map-optimizer/src/core/adapter.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Adapter**.
- **Tamanho no snapshot:** 1060 bytes

## 397. 🛠️ `tools/map-optimizer/src/core/asset.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Asset**.
- **Tamanho no snapshot:** 2297 bytes

## 398. 🛠️ `tools/map-optimizer/src/core/index.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Index**.
- **Tamanho no snapshot:** 411 bytes

## 399. 🛠️ `tools/map-optimizer/src/core/ir.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Ir**.
- **Tamanho no snapshot:** 1512 bytes

## 400. 🧪 `tools/map-optimizer/src/core/pipeline.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Pipeline**.
- **Tamanho no snapshot:** 3744 bytes

## 401. 🛠️ `tools/map-optimizer/src/core/pipeline.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Pipeline**.
- **Tamanho no snapshot:** 3336 bytes

## 402. 🧪 `tools/map-optimizer/src/core/report.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Report**.
- **Tamanho no snapshot:** 1335 bytes

## 403. 🛠️ `tools/map-optimizer/src/core/report.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Report**.
- **Tamanho no snapshot:** 3249 bytes

## 404. 🛠️ `tools/map-optimizer/src/optimizer.config.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Optimizer Config**.
- **Tamanho no snapshot:** 1368 bytes

## 405. 🧪 `tools/map-optimizer/src/plugins/condition-prelit.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Condition Prelit**.
- **Tamanho no snapshot:** 2157 bytes

## 406. 🛠️ `tools/map-optimizer/src/plugins/condition-prelit.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Condition Prelit**.
- **Tamanho no snapshot:** 4172 bytes

## 407. 🧪 `tools/map-optimizer/src/plugins/dedupe-faces.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Dedupe Faces**.
- **Tamanho no snapshot:** 1245 bytes

## 408. 🛠️ `tools/map-optimizer/src/plugins/dedupe-faces.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Dedupe Faces**.
- **Tamanho no snapshot:** 1954 bytes

## 409. 🧪 `tools/map-optimizer/src/plugins/degenerate-triangles.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Degenerate Triangles**.
- **Tamanho no snapshot:** 1827 bytes

## 410. 🛠️ `tools/map-optimizer/src/plugins/degenerate-triangles.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Degenerate Triangles**.
- **Tamanho no snapshot:** 2300 bytes

## 411. 🛠️ `tools/map-optimizer/src/plugins/pass-through.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Pass Through**.
- **Tamanho no snapshot:** 507 bytes

## 412. 🧪 `tools/map-optimizer/src/plugins/prune-vertices.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Prune Vertices**.
- **Tamanho no snapshot:** 1595 bytes

## 413. 🛠️ `tools/map-optimizer/src/plugins/prune-vertices.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Prune Vertices**.
- **Tamanho no snapshot:** 1633 bytes

## 414. 🧪 `tools/map-optimizer/src/plugins/recompute-normals.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Recompute Normals**.
- **Tamanho no snapshot:** 4237 bytes

## 415. 🛠️ `tools/map-optimizer/src/plugins/recompute-normals.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Recompute Normals**.
- **Tamanho no snapshot:** 6895 bytes

## 416. 🧪 `tools/map-optimizer/src/plugins/refine-surface.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Refine Surface**.
- **Tamanho no snapshot:** 2843 bytes

## 417. 🛠️ `tools/map-optimizer/src/plugins/refine-surface.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Refine Surface**.
- **Tamanho no snapshot:** 18569 bytes

## 418. 🧪 `tools/map-optimizer/src/plugins/smooth-normals.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Smooth Normals**.
- **Tamanho no snapshot:** 2552 bytes

## 419. 🛠️ `tools/map-optimizer/src/plugins/smooth-normals.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Smooth Normals**.
- **Tamanho no snapshot:** 3244 bytes

## 420. 🧪 `tools/map-optimizer/src/plugins/synthesize-night.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Synthesize Night**.
- **Tamanho no snapshot:** 1238 bytes

## 421. 🛠️ `tools/map-optimizer/src/plugins/synthesize-night.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Synthesize Night**.
- **Tamanho no snapshot:** 3685 bytes

## 422. 🛠️ `tools/map-optimizer/src/plugins/vertex-compaction.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Vertex Compaction**.
- **Tamanho no snapshot:** 1845 bytes

## 423. 🧪 `tools/map-optimizer/src/plugins/weld-vertices.test.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Weld Vertices**.
- **Tamanho no snapshot:** 1293 bytes

## 424. 🛠️ `tools/map-optimizer/src/plugins/weld-vertices.ts`

- **Área:** Tool / Map optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Weld Vertices**.
- **Tamanho no snapshot:** 2480 bytes

## 425. 🧪 `tools/rw-codec/src/chunk.test.ts`

- **Área:** Tool / RW codec
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Chunk**.
- **Tamanho no snapshot:** 782 bytes

## 426. 🛠️ `tools/rw-codec/src/chunk.ts`

- **Área:** Tool / RW codec
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Chunk**.
- **Tamanho no snapshot:** 4619 bytes

## 427. 🛠️ `tools/rw-codec/src/dff.ts`

- **Área:** Tool / RW codec
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Dff**.
- **Tamanho no snapshot:** 1062 bytes

## 428. 🧪 `tools/rw-codec/src/dxt-encode.test.ts`

- **Área:** Tool / RW codec
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Dxt Encode**.
- **Tamanho no snapshot:** 2102 bytes

## 429. 🛠️ `tools/rw-codec/src/dxt-encode.ts`

- **Área:** Tool / RW codec
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Dxt Encode**.
- **Tamanho no snapshot:** 7258 bytes

## 430. 🧪 `tools/rw-codec/src/dxt.test.ts`

- **Área:** Tool / RW codec
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Dxt**.
- **Tamanho no snapshot:** 2243 bytes

## 431. 🛠️ `tools/rw-codec/src/dxt.ts`

- **Área:** Tool / RW codec
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Dxt**.
- **Tamanho no snapshot:** 4115 bytes

## 432. 🧪 `tools/rw-codec/src/geometry-struct.test.ts`

- **Área:** Tool / RW codec
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Geometry Struct**.
- **Tamanho no snapshot:** 1846 bytes

## 433. 🛠️ `tools/rw-codec/src/geometry-struct.ts`

- **Área:** Tool / RW codec
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Geometry Struct**.
- **Tamanho no snapshot:** 5933 bytes

## 434. 🧪 `tools/rw-codec/src/mip.test.ts`

- **Área:** Tool / RW codec
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Mip**.
- **Tamanho no snapshot:** 1399 bytes

## 435. 🛠️ `tools/rw-codec/src/mip.ts`

- **Área:** Tool / RW codec
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Mip**.
- **Tamanho no snapshot:** 1812 bytes

## 436. 🧪 `tools/rw-codec/src/texture-native.test.ts`

- **Área:** Tool / RW codec
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Texture Native**.
- **Tamanho no snapshot:** 2621 bytes

## 437. 🛠️ `tools/rw-codec/src/texture-native.ts`

- **Área:** Tool / RW codec
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Texture Native**.
- **Tamanho no snapshot:** 3238 bytes

## 438. 🧪 `tools/timecyc-builder/src/core/merge.test.ts`

- **Área:** Tool / Timecyc builder
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Merge**.
- **Tamanho no snapshot:** 4316 bytes

## 439. 🛠️ `tools/timecyc-builder/src/core/merge.ts`

- **Área:** Tool / Timecyc builder
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Merge**.
- **Tamanho no snapshot:** 3378 bytes

## 440. 🧪 `tools/timecyc-builder/src/core/timecyc-manager.test.ts`

- **Área:** Tool / Timecyc builder
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Timecyc Manager**.
- **Tamanho no snapshot:** 1767 bytes

## 441. 🛠️ `tools/timecyc-builder/src/core/timecyc-manager.ts`

- **Área:** Tool / Timecyc builder
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Timecyc Manager**.
- **Tamanho no snapshot:** 1340 bytes

## 442. 🛠️ `tools/timecyc-builder/src/index.ts`

- **Área:** Tool / Timecyc builder
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Index**.
- **Tamanho no snapshot:** 908 bytes

## 443. 🛠️ `tools/timecyc-builder/src/interfaces/timecyc.interface.ts`

- **Área:** Tool / Timecyc builder
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Timecyc Interface**.
- **Tamanho no snapshot:** 471 bytes

## 444. 🧪 `tools/tool-kit/src/archive/img.test.ts`

- **Área:** Tool / Toolkit
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Img**.
- **Tamanho no snapshot:** 1989 bytes

## 445. 🛠️ `tools/tool-kit/src/archive/img.ts`

- **Área:** Tool / Toolkit
- **Tipo:** Tooling/configuração
- **Descrição:** Infraestrutura de archive/cache **Img**.
- **Tamanho no snapshot:** 3165 bytes

## 446. 🧪 `tools/tool-kit/src/mesh/simplify.test.ts`

- **Área:** Tool / Toolkit
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Simplify**.
- **Tamanho no snapshot:** 2311 bytes

## 447. 🛠️ `tools/tool-kit/src/mesh/simplify.ts`

- **Área:** Tool / Toolkit
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Simplify**.
- **Tamanho no snapshot:** 15992 bytes

## 448. 🧪 `tools/tool-kit/src/mesh/smooth-normals.test.ts`

- **Área:** Tool / Toolkit
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Smooth Normals**.
- **Tamanho no snapshot:** 1432 bytes

## 449. 🛠️ `tools/tool-kit/src/mesh/smooth-normals.ts`

- **Área:** Tool / Toolkit
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Smooth Normals**.
- **Tamanho no snapshot:** 10220 bytes

## 450. 🧪 `tools/vehicle-optimizer/src/adapters/gta-sa/copy-effects.test.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Copy Effects**.
- **Tamanho no snapshot:** 2561 bytes

## 451. 🛠️ `tools/vehicle-optimizer/src/adapters/gta-sa/copy-effects.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Copy Effects**.
- **Tamanho no snapshot:** 9133 bytes

## 452. 🛠️ `tools/vehicle-optimizer/src/adapters/gta-sa/index.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Index**.
- **Tamanho no snapshot:** 2166 bytes

## 453. 🧪 `tools/vehicle-optimizer/src/adapters/gta-sa/scale.test.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Teste automatizado
- **Descrição:** Teste automatizado relacionado a **Scale**.
- **Tamanho no snapshot:** 8911 bytes

## 454. 🛠️ `tools/vehicle-optimizer/src/adapters/gta-sa/scale.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Scale**.
- **Tamanho no snapshot:** 11956 bytes

## 455. 🛠️ `tools/vehicle-optimizer/src/cli.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Cli**.
- **Tamanho no snapshot:** 2060 bytes

## 456. 🛠️ `tools/vehicle-optimizer/src/core/index.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Index**.
- **Tamanho no snapshot:** 134 bytes

## 457. 🛠️ `tools/vehicle-optimizer/src/core/report.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Report**.
- **Tamanho no snapshot:** 950 bytes

## 458. 🛠️ `tools/vehicle-optimizer/src/core/types.ts`

- **Área:** Tool / Vehicle optimizer
- **Tipo:** Tooling/configuração
- **Descrição:** Ferramenta offline **Types**.
- **Tamanho no snapshot:** 1714 bytes

## 459. 🛠️ `vite.config.ts`

- **Área:** Config / Tooling
- **Tipo:** Tooling/configuração
- **Descrição:** Configuração **Vite Config**.
- **Tamanho no snapshot:** 4102 bytes

## 460. 🛠️ `vitest.config.ts`

- **Área:** Config / Tooling
- **Tipo:** Tooling/configuração
- **Descrição:** Configuração **Vitest Config**.
- **Tamanho no snapshot:** 3323 bytes

# Parte VIII — Observações da auditoria

- O snapshot auditado é o `main` remoto no commit `ec6021e47eb7c7e1bf7cd138419b89939a450132`. Uma branch local ainda não enviada ao GitHub pode conter alterações adicionais e deve ser re-auditada pelo Blackroot quando a sessão voltar a expor o MCP.
- O documento `docs/development/test-coverage.md` registra **108 test files / 651 passing** no escopo headless medido em 2026-06-13; o inventário literal acima conta **172 arquivos de teste/spec/e2e** em todo o repositório porque também inclui tooling e Playwright.
- O mapa de gaps usa como fonte primária o código, `roadmap.md`, `CHANGELOG.md`, `docs/architecture.md` e `docs/features/*`.
- Nenhum sistema foi marcado como implementado apenas por aparecer em texto de plano.

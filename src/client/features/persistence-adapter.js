/** persistence-adapter: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        saveData: async function saveData(options = {}) {
            ctx.appData.updatedAt = new Date().toISOString();
            await ctx.repository.save(ctx.appData, ctx.preferences, {
                allowCardRemoval: options.allowCardRemoval === true,
            });
            return true;
        },
    });
}

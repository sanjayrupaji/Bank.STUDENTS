const { prisma } = require("../config/db");
const { centsToDisplay } = require("../utils/money");

let getIO = () => null;

function registerSocketGetter(fn) {
  getIO = typeof fn === "function" ? fn : () => null;
}

/**
 * After a successful financial commit (not idempotent cache hits).
 */
function notifyTransactionCommitted(payload) {
  const io = getIO();
  if (!io || !payload?.transaction) return;

  io.to("admin").emit("transaction:new", {
    transaction: payload.transaction,
    accounts: payload.accounts || [],
    at: Date.now(),
  });
  io.to("admin").emit("analytics:refresh", { at: Date.now() });

  const ids = (payload.accounts || []).map((a) => a.id).filter(Boolean);
  if (!ids.length) return;

  prisma.account.findMany({
    where: { id: { in: ids } },
    select: { id: true, userId: true, balanceCents: true },
  })
    .then((accs) => {
      for (const a of accs) {
        const uid = a.userId;
        io.to(`user:${uid}`).emit("account:update", {
          accountId: a.id,
          balanceCents: a.balanceCents,
          balance: centsToDisplay(a.balanceCents),
        });
      }
    })
    .catch(() => {});
}

module.exports = { registerSocketGetter, notifyTransactionCommitted };

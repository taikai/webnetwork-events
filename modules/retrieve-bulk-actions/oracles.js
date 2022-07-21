import { fromSmartContractDecimals } from "@taikai/dappkit";
import db from "../../db/index.js";
import { error } from "../../utils/logger-handler.js";

export async function getOraclesChangedEvents(events, network, contract) {
  const _network = await db.networks.findOne({
    where: {
      networkAddress: network.networkAddress,
    },
  });

  if (!_network) return error(`Network ${network.networkAddress} not found`);

  try {
    const councilAmount = await contract?.network?.councilAmount();
    const existing_members = [...(_network?.councilMembers || [])];
    const remove_members = [];

    for (const event of events) {
      const { newLockedTotal, actor } = event.returnValues;

      const newTotal = fromSmartContractDecimals(newLockedTotal);

      if (newTotal >= councilAmount && !existing_members.includes(actor))
        existing_members.push(actor);
      else if (newTotal < councilAmount && existing_members.includes(actor))
        remove_members.push(actor);
    }

    const new_members = existing_members.filter(
      (address) => !remove_members.includes(address)
    );

    _network.councilMembers = new_members;
    await _network.save();
  } catch (err) {
    error(`Error update ammount oracles: ${err.message}`);
  }
}

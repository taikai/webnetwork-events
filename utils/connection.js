import "dotenv/config"
import {Web3Connection} from "@taikai/dappkit";

const {CHAIN_RPC: web3Host, CHAIN_PRIVATE_KEY: privateKey} = process.env;

export function connection() {
  const conn = new Web3Connection({web3Host, privateKey, skipWindowAssignment: true});
  conn.start();
  return conn;
}
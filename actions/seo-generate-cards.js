import { subMinutes } from "date-fns";
import { Op } from "sequelize";
import db from "../db/index.js";
import generateCard from "../modules/generate-bounty-cards.js";
import ipfsService from "../services/ipfs-service.js";
import { error, info } from "../utils/logger-handler.js";

export const name = "seo-generate-cards";
export const schedule = "30 * * * * *";
export const description = "generating SEO cards for all updated issues";
export const author = "clarkjoao";

export async function action() {
  info("Starting SEO cards generation");

  const where = {
    [Op.or]: [
      { seoImage: null },
      { updatedAt: { [Op.gte]: subMinutes(+new Date(), 25) } },
    ],
  };

  const include = [
    { association: "developers" },
    { association: "merge_proposals" },
    { association: "pull_requests" },
    { association: "network" },
    { association: "repository" },
    { association: "token" },
  ];

  const issues = await db.issues.findAll({
    where,
    include,
  });

  info(`Found ${issues.length} issues to generate SEO cards`);

  for (const issue of issues) {
    try {
      const card = await generateCard(issue);

      const { path } = await ipfsService.add(card);

      await issue.update({ seoImage: path });

      info(`SEO card generated for issue ${issue.githubId}`);
    } catch (err) {
      error(`Error generating SEO card for issue ${issue.githubId}`, err);
    }
  }
}

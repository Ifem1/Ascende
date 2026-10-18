# Public GenVM verification fixtures

These files contain fictional, deterministic test evidence used only to exercise Ascende's live Studionet evidence and consensus path. They do not describe real work, people, milestones, or achievements. Their contents are version-pinned by Git commit for the first frozen HTTPS authority. A matching second-authority copy is published as a versioned public GitHub Gist for the second HTTPS hostname. Both hosts are controlled by GitHub; different hostnames and matching bytes do not establish independent publishers or ownership.

The expected cases are: stage A, both sources say `PASS`; stage B initial evidence, both say `FAIL`; stage B challenge evidence, both say `PASS`; stage C, the sources conflict (`PASS` and `FAIL`). These fixtures test the contract's classification and challenge lineage only. They do not establish real-world truth or publisher independence.

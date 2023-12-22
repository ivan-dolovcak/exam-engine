use `EXAM_ENGINE`;

rename table `Submittion` to `Submission`;

alter table `Submission` rename column `submittionJson` to `submissionJSON`;
alter table `Document` rename column `documentJson` to `documentJSON`;
alter table `Document` rename column `solutionJson` to `solutionJSON`;

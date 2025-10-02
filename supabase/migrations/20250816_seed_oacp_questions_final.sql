-- Seed OACP step questions from authored SQL content
do $$
declare
  ver_id uuid;
begin
  -- Find latest active version for OACP
  select id into ver_id
  from public.test_versions
  where step_id = 'oacp'
    and is_active
    and published_at <= now()
  order by published_at desc
  limit 1;
  if ver_id is null then
    raise exception 'No active test_versions row found for step oacp';
  end if;

  -- Staging table (temporary)
  create temporary table oacp_written_questions_tmp (
    id serial primary key,
    category text not null,
    question text not null,
    option_a text not null,
    option_b text not null,
    option_c text not null,
    option_d text not null,
    correct_option char(1) not null check (correct_option in ('A','B','C','D'))
  ) on commit drop;

  -- Insert authored questions
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Choose the sentence that is grammatically correct.', 'Each officer and every witness was interviewed.', 'Each officer and every witness were interviewed.', 'Each officer along with every witness were interviewed.', 'Each officer with every witness have been interviewed.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Select the correctly spelled word.', 'Occurrence', 'Occurance', 'Occurence', 'Ocurrence', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Which sentence is most concise and formal for a police report?', 'The suspect fled on foot northbound on King Street.', 'The suspect took off running going north on King Street.', 'The suspect started to flee and then ran north bound on King Street.', 'The suspect, at that time, fled quickly in a northerly direction on King Street.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Choose the sentence with correct punctuation.', 'The witness stated, “I saw the blue car stop suddenly.”', 'The witness stated “I saw the blue car stop suddenly”.', 'The witness stated, I saw the blue car stop suddenly.', 'The witness stated I saw the blue car stop suddenly.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Choose the correct word: The weather had a significant ____ on visibility.', 'effect', 'affect', 'effects', 'affects', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Which sentence maintains parallel structure?', 'The recruit must be punctual, professional, and respectful.', 'The recruit must be punctual, showing professionalism, and respectful.', 'The recruit must be punctual, to show professionalism, and respectful.', 'The recruit must be punctual, professional, and with respect.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Choose the correct pronoun: If any officer needs a notepad, ____ can take one from the desk.', 'they', 'he', 'she', 'it', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Select the properly capitalized sentence.', 'The suspect was charged under the Criminal Code of Canada.', 'The suspect was charged under the criminal code of canada.', 'The Suspect was charged under the Criminal code of Canada.', 'The suspect was charged under the Criminal Code Of Canada.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Which option corrects the misplaced modifier? Original: ''Running down the alley, the fence stopped the officer.''', 'Running down the alley, the officer was stopped by the fence.', 'The fence, running down the alley, stopped the officer.', 'Running down the alley stopped the fence and the officer.', 'The officer and fence were running down the alley.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Choose the sentence with correct subject–verb agreement.', 'The data from the cameras is being reviewed by the analyst.', 'The data from the cameras are being reviewed by the analyst.', 'The data from the camera were being reviewed by the analyst.', 'The data from the cameras has been review by the analyst.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Select the sentence that uses ''its/it''s'' correctly.', 'The vehicle lost its left mirror as it struck the pole.', 'The vehicle lost it’s left mirror as it struck the pole.', 'Its a vehicle that lost it’s left mirror.', 'It’s mirror was lost from the vehicle when it struck the pole.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Pick the best topic sentence for a police report paragraph about scene security.', 'Upon arrival, I established a perimeter and restricted access to preserve evidence.', 'I think scene security is very important in policing.', 'Scene security is something we always do first, usually.', 'Sometimes we do scene security, but not always.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Choose the correct sentence.', 'Neither the sergeant nor the constables were available for comment.', 'Neither the sergeant nor the constables was available for comment.', 'Neither the sergeant or the constables were available for comment.', 'Neither the sergeant or the constables was available for comment.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Which word correctly completes the sentence: The investigator will ____ the footage for inconsistencies.', 'review', 'reveal', 'revere', 'revert', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Select the sentence that avoids redundancy.', 'The officer entered the residence at 21:10 hours.', 'The officer entered inside the residence at 9:10 PM hours.', 'At 21:10 hours in the evening the officer entered into the residence.', 'The officer at 21:10 hours entered inside of the residence.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Choose the sentence in active voice.', 'The officer interviewed the witness.', 'The witness was interviewed by the officer.', 'An interview of the witness was conducted by the officer.', 'There was an interview that was done with the witness by the officer.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Identify the sentence with correct comma usage.', 'Before leaving, the officer secured the evidence locker.', 'Before leaving the officer, secured the evidence locker.', 'Before, leaving the officer secured the evidence locker.', 'Before leaving the officer secured, the evidence locker.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Which sentence maintains consistent verb tense?', 'I arrived, spoke with the clerk, and collected the statement.', 'I arrive, spoke with the clerk, and collected the statement.', 'I arrived, speak with the clerk, and collected the statement.', 'I arrived, spoke with the clerk, and collect the statement.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Select the correctly spelled word used often in reports.', 'Separate', 'Seperate', 'Sepparate', 'Seperatee', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Language', 'Choose the best order for these sentences to form a logical report: (1) Evidence markers were placed. (2) The scene was secured. (3) Photographs were taken.', '2, 3, 1', '3, 2, 1', '1, 2, 3', '2, 1, 3', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'All recruits must pass the written test. Taylor is a recruit. What must be true?', 'Taylor must pass the written test.', 'Taylor already passed the fitness test.', 'Taylor will fail the written test.', 'Taylor is not required to take the test.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Complete the analogy: Evidence is to Investigation as Symptom is to _____.', 'Diagnosis', 'Operation', 'Prescription', 'Surgery', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Which number completes the sequence: 3, 6, 9, 12, __?', '15', '18', '20', '21', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'If some officers are certified first-aiders and all first-aiders carry kits, which must be true?', 'Some officers carry kits.', 'All officers carry kits.', 'No officers carry kits.', 'Only sergeants carry kits.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'A call starts at 18:40 and ends 35 minutes later. What is the end time?', '19:15', '19:05', '19:10', '19:25', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Choose the statement that must be true: If it is raining, the parade is cancelled. The parade is not cancelled.', 'It is not raining.', 'It is raining.', 'The parade might be cancelled for another reason.', 'We cannot conclude anything.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Which option logically follows: All marked cars have radios. This vehicle has a radio.', 'It may or may not be a marked car.', 'It must be a marked car.', 'It cannot be a marked car.', 'It is not a police vehicle.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Find the odd pair in the pattern: (2,4), (3,6), (4,8), (5,11).', '(5,11)', '(2,4)', '(3,6)', '(4,8)', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Arrange tasks given constraints: A must be before B; C must be after B. Which order is valid?', 'A, B, C', 'B, A, C', 'A, C, B', 'C, B, A', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Which conclusion is valid? Some reports are urgent. All urgent items are prioritized.', 'Some reports are prioritized.', 'All reports are prioritized.', 'No reports are prioritized.', 'Reports cannot be prioritized.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Complete the series: J, L, N, P, __', 'R', 'S', 'Q', 'T', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'A suspect travels 24 km in 30 minutes at constant speed. How far in 80 minutes?', '64 km', '40 km', '48 km', '60 km', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Which statement must be false? All keys open lockers. This key does not open any locker.', 'This key is not a locker key.', 'This key is broken but still a locker key.', 'Some lockers have no keys.', 'All lockers are open.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Choose the best inference: Patrols increase visibility. Visibility deters theft.', 'Patrols can help deter theft.', 'Patrols stop all theft.', 'Theft causes patrols.', 'Patrols reduce visibility.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Which number completes: 1, 1, 2, 3, 5, __', '8', '7', '9', '6', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'If none of the bicycles are motorized and all e-bikes are motorized, which must be true?', 'No bicycles are e-bikes.', 'All bicycles are e-bikes.', 'Some bicycles are e-bikes.', 'Bicycles might be e-bikes.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'A statement set: (1) Exactly one of these statements is true. (2) Statement 3 is false. (3) Statement 1 is true. Which statement is true?', 'Statement 2', 'Statement 1', 'Statement 3', 'None are true', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Select the best conclusion: The store closes at 21:00. Arrivals after 21:00 cannot enter. Pat arrived at 21:05.', 'Pat cannot enter.', 'Pat can still enter.', 'Pat entered through a side door.', 'The store was open late.', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Pick the correct analogy: Map is to Directions as Recipe is to _____.', 'Instructions', 'Ingredients', 'Restaurant', 'Cookbook', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Reasoning', 'Which shape completes the pattern count: triangle (3), square (4), pentagon (5), __ (6)?', 'Hexagon', 'Heptagon', 'Octagon', 'Nonagon', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'An item costs $64. HST is 13%. What is the total price?', '$72.32', '$70.00', '$71.20', '$73.92', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'A vehicle travels 180 km in 3 hours. What is the average speed?', '60 km/h', '65 km/h', '75 km/h', '90 km/h', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'What is 15% of 240?', '36', '30', '32', '28', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'Solve for x: 4x − 12 = 20.', '8', '6', '10', '4', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'A radio costs $120 but is discounted by 25%. What is the sale price before tax?', '$90', '$95', '$85', '$100', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'Convert 3/5 to a decimal.', '0.6', '0.8', '0.75', '0.65', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'A patrol route is 12 km. If covered in 1 hour 20 minutes, what is the average speed?', '9 km/h', '10 km/h', '8 km/h', '7.5 km/h', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'Find the mean of: 6, 8, 10, 6.', '7.5', '7', '8', '6.5', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'Solve: 18 ÷ 3 × 4.', '24', '6', '72', '12', 'A');
  insert into oacp_written_questions_tmp (category, question, option_a, option_b, option_c, option_d, correct_option) values ('Math', 'A ratio of officers to vehicles is 5:2. If there are 20 officers, how many vehicles?', '8', '6', '10', '12', 'A');

  -- Replace OACP test questions with authored content
  delete from public.test_questions where version_id = ver_id;

  insert into public.test_questions (version_id, order_index, prompt, choices, correct_index)
  select
    ver_id,
    row_number() over (order by id) as order_index,
    q.question as prompt,
    jsonb_build_array(q.option_a, q.option_b, q.option_c, q.option_d) as choices,
    case q.correct_option when 'A' then 0 when 'B' then 1 when 'C' then 2 else 3 end as correct_index
  from oacp_written_questions_tmp q;

end $$;



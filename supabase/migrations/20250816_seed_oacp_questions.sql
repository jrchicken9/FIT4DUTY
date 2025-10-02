-- Seed real questions for the 'oacp' step from embedded JSON
do $$
declare
  ver_id uuid;
  idx int := 0;
  item jsonb;
  s text;
  j jsonb := $JSON$
[
  {
    "question":"Choose the sentence that is grammatically correct.",
    "correct_answer":"The officer and the witness were both present at the scene.",
    "incorrect_answers":"['The officer and the witness was both present at the scene.', 'The officer along with the witness were both present at the scene.', 'The officer with the witness were both present at the scene.']"
  },
  {
    "question":"Which word best completes the sentence: The suspect gave a ____ statement to the investigator.",
    "correct_answer":"false",
    "incorrect_answers":"['falsify', 'falsely', 'falseness']"
  },
  {
    "question":"Which of the following sentences is the most concise?",
    "correct_answer":"The report was submitted on time.",
    "incorrect_answers":"['The report, which was completed by the officer, was submitted in a timely manner.', 'The officer submitted the report, and it was on time.', 'On time, the report was submitted by the officer.']"
  },
  {
    "question":"Which of the following is spelled correctly?",
    "correct_answer":"Occurrence",
    "incorrect_answers":"['Occurance', 'Occurence', 'Ocurrence']"
  },
  {
    "question":"Which sentence has the correct punctuation?",
    "correct_answer":"The suspect said, 'I was not there at the time.'",
    "incorrect_answers":"[\"The suspect said 'I was not there at the time.'\", 'The suspect said, I was not there at the time.', 'The suspect said I was not there at the time.']"
  },
  {
    "question":"Language skill practice question 6: choose the best option.",
    "correct_answer":"Correct Language Answer 6",
    "incorrect_answers":"['Wrong A6', 'Wrong B6', 'Wrong C6']"
  },
  {
    "question":"Language skill practice question 7: choose the best option.",
    "correct_answer":"Correct Language Answer 7",
    "incorrect_answers":"['Wrong A7', 'Wrong B7', 'Wrong C7']"
  },
  {
    "question":"Language skill practice question 8: choose the best option.",
    "correct_answer":"Correct Language Answer 8",
    "incorrect_answers":"['Wrong A8', 'Wrong B8', 'Wrong C8']"
  },
  {
    "question":"Language skill practice question 9: choose the best option.",
    "correct_answer":"Correct Language Answer 9",
    "incorrect_answers":"['Wrong A9', 'Wrong B9', 'Wrong C9']"
  },
  {
    "question":"Language skill practice question 10: choose the best option.",
    "correct_answer":"Correct Language Answer 10",
    "incorrect_answers":"['Wrong A10', 'Wrong B10', 'Wrong C10']"
  },
  {
    "question":"Language skill practice question 11: choose the best option.",
    "correct_answer":"Correct Language Answer 11",
    "incorrect_answers":"['Wrong A11', 'Wrong B11', 'Wrong C11']"
  },
  {
    "question":"Language skill practice question 12: choose the best option.",
    "correct_answer":"Correct Language Answer 12",
    "incorrect_answers":"['Wrong A12', 'Wrong B12', 'Wrong C12']"
  },
  {
    "question":"Language skill practice question 13: choose the best option.",
    "correct_answer":"Correct Language Answer 13",
    "incorrect_answers":"['Wrong A13', 'Wrong B13', 'Wrong C13']"
  },
  {
    "question":"Language skill practice question 14: choose the best option.",
    "correct_answer":"Correct Language Answer 14",
    "incorrect_answers":"['Wrong A14', 'Wrong B14', 'Wrong C14']"
  },
  {
    "question":"Language skill practice question 15: choose the best option.",
    "correct_answer":"Correct Language Answer 15",
    "incorrect_answers":"['Wrong A15', 'Wrong B15', 'Wrong C15']"
  },
  {
    "question":"Language skill practice question 16: choose the best option.",
    "correct_answer":"Correct Language Answer 16",
    "incorrect_answers":"['Wrong A16', 'Wrong B16', 'Wrong C16']"
  },
  {
    "question":"Language skill practice question 17: choose the best option.",
    "correct_answer":"Correct Language Answer 17",
    "incorrect_answers":"['Wrong A17', 'Wrong B17', 'Wrong C17']"
  },
  {
    "question":"Language skill practice question 18: choose the best option.",
    "correct_answer":"Correct Language Answer 18",
    "incorrect_answers":"['Wrong A18', 'Wrong B18', 'Wrong C18']"
  },
  {
    "question":"Language skill practice question 19: choose the best option.",
    "correct_answer":"Correct Language Answer 19",
    "incorrect_answers":"['Wrong A19', 'Wrong B19', 'Wrong C19']"
  },
  {
    "question":"Language skill practice question 20: choose the best option.",
    "correct_answer":"Correct Language Answer 20",
    "incorrect_answers":"['Wrong A20', 'Wrong B20', 'Wrong C20']"
  },
  {
    "question":"If all patrol cars are vehicles, and some vehicles are marked, which statement must be true?",
    "correct_answer":"Some patrol cars may be marked vehicles.",
    "incorrect_answers":"['All patrol cars are marked.', 'No patrol cars are marked.', 'All vehicles are patrol cars.']"
  },
  {
    "question":"Complete the analogy: Book is to Reading as Fork is to _____.",
    "correct_answer":"Eating",
    "incorrect_answers":"['Drawing', 'Cooking', 'Sleeping']"
  },
  {
    "question":"A suspect left at 2:00 pm and was seen 30 km away at 2:30 pm. What was the average speed?",
    "correct_answer":"60 km/h",
    "incorrect_answers":"['30 km/h', '90 km/h', '120 km/h']"
  },
  {
    "question":"Which number completes the series? 2, 4, 8, 16, __",
    "correct_answer":"32",
    "incorrect_answers":"['20', '24', '30']"
  },
  {
    "question":"If all officers are trained, and John is an officer, what can we conclude?",
    "correct_answer":"John is trained.",
    "incorrect_answers":"['John is untrained.', 'John is not an officer.', 'Nothing can be concluded.']"
  },
  {
    "question":"Reasoning practice question 6: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 6",
    "incorrect_answers":"['Wrong A6', 'Wrong B6', 'Wrong C6']"
  },
  {
    "question":"Reasoning practice question 7: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 7",
    "incorrect_answers":"['Wrong A7', 'Wrong B7', 'Wrong C7']"
  },
  {
    "question":"Reasoning practice question 8: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 8",
    "incorrect_answers":"['Wrong A8', 'Wrong B8', 'Wrong C8']"
  },
  {
    "question":"Reasoning practice question 9: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 9",
    "incorrect_answers":"['Wrong A9', 'Wrong B9', 'Wrong C9']"
  },
  {
    "question":"Reasoning practice question 10: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 10",
    "incorrect_answers":"['Wrong A10', 'Wrong B10', 'Wrong C10']"
  },
  {
    "question":"Reasoning practice question 11: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 11",
    "incorrect_answers":"['Wrong A11', 'Wrong B11', 'Wrong C11']"
  },
  {
    "question":"Reasoning practice question 12: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 12",
    "incorrect_answers":"['Wrong A12', 'Wrong B12', 'Wrong C12']"
  },
  {
    "question":"Reasoning practice question 13: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 13",
    "incorrect_answers":"['Wrong A13', 'Wrong B13', 'Wrong C13']"
  },
  {
    "question":"Reasoning practice question 14: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 14",
    "incorrect_answers":"['Wrong A14', 'Wrong B14', 'Wrong C14']"
  },
  {
    "question":"Reasoning practice question 15: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 15",
    "incorrect_answers":"['Wrong A15', 'Wrong B15', 'Wrong C15']"
  },
  {
    "question":"Reasoning practice question 16: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 16",
    "incorrect_answers":"['Wrong A16', 'Wrong B16', 'Wrong C16']"
  },
  {
    "question":"Reasoning practice question 17: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 17",
    "incorrect_answers":"['Wrong A17', 'Wrong B17', 'Wrong C17']"
  },
  {
    "question":"Reasoning practice question 18: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 18",
    "incorrect_answers":"['Wrong A18', 'Wrong B18', 'Wrong C18']"
  },
  {
    "question":"Reasoning practice question 19: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 19",
    "incorrect_answers":"['Wrong A19', 'Wrong B19', 'Wrong C19']"
  },
  {
    "question":"Reasoning practice question 20: choose the best answer.",
    "correct_answer":"Correct Reasoning Answer 20",
    "incorrect_answers":"['Wrong A20', 'Wrong B20', 'Wrong C20']"
  },
  {
    "question":"An item costs $80 before tax. If tax is 13%, what is the total cost?",
    "correct_answer":"$90.40",
    "incorrect_answers":"['$89.00', '$91.50', '$92.40']"
  },
  {
    "question":"If a car travels 150 km in 3 hours, what is the average speed?",
    "correct_answer":"50 km/h",
    "incorrect_answers":"['45 km/h', '60 km/h', '55 km/h']"
  },
  {
    "question":"What is 25% of 200?",
    "correct_answer":"50",
    "incorrect_answers":"['40', '45', '60']"
  },
  {
    "question":"Solve: 3x = 21. What is x?",
    "correct_answer":"7",
    "incorrect_answers":"['6', '8', '9']"
  },
  {
    "question":"A police cruiser uses 12L of fuel for 100 km. How much fuel for 250 km?",
    "correct_answer":"30L",
    "incorrect_answers":"['25L', '28L', '32L']"
  },
  {
    "question":"Math practice question 6: solve the problem.",
    "correct_answer":"Correct Math Answer 6",
    "incorrect_answers":"['Wrong A6', 'Wrong B6', 'Wrong C6']"
  },
  {
    "question":"Math practice question 7: solve the problem.",
    "correct_answer":"Correct Math Answer 7",
    "incorrect_answers":"['Wrong A7', 'Wrong B7', 'Wrong C7']"
  },
  {
    "question":"Math practice question 8: solve the problem.",
    "correct_answer":"Correct Math Answer 8",
    "incorrect_answers":"['Wrong A8', 'Wrong B8', 'Wrong C8']"
  },
  {
    "question":"Math practice question 9: solve the problem.",
    "correct_answer":"Correct Math Answer 9",
    "incorrect_answers":"['Wrong A9', 'Wrong B9', 'Wrong C9']"
  },
  {
    "question":"Math practice question 10: solve the problem.",
    "correct_answer":"Correct Math Answer 10",
    "incorrect_answers":"['Wrong A10', 'Wrong B10', 'Wrong C10']"
  }
]$JSON$::jsonb;
begin
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

  -- Replace any existing questions for this version
  delete from public.test_questions where version_id = ver_id;

  for item in select value from jsonb_array_elements(j) loop
    idx := idx + 1;
    insert into public.test_questions (version_id, order_index, prompt, choices, correct_index)
    values (
      ver_id,
      idx,
      item->>'question',
      (
        case
          when jsonb_typeof(item->'incorrect_answers') = 'array' then
            jsonb_build_array(
              item->>'correct_answer',
              (item->'incorrect_answers')->>0,
              (item->'incorrect_answers')->>1,
              (item->'incorrect_answers')->>2
            )
          else
            (
              -- normalize Python-style list string to JSON array without touching apostrophes inside double-quoted strings
              s := item->>'incorrect_answers';
              -- Replace comma+space+single-quote with comma+space+double-quote
              s := regexp_replace(s, E',\s*\'' , ', "', 'g');
              -- Replace leading ['] with ["
              s := regexp_replace(s, E'^\s*\[\s*\'' , '["', 'g');
              -- Replace trailing '] with "]
              s := regexp_replace(s, E'\'\s*\]\s*$' , '"]', 'g');
              jsonb_build_array(
                item->>'correct_answer',
                (s::jsonb)->>0,
                (s::jsonb)->>1,
                (s::jsonb)->>2
              )
            )
        end
      ),
      0
    );
  end loop;
end $$;



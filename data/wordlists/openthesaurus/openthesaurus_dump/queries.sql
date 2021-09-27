-- select all words that have "person" etc

select t.word from 
synset s1
join synset_link sl on s1.id = sl.target_synset_id 
join synset s2 on s2.id = sl.synset_id 
join term t on t.synset_id = s2.id 
join link_type lt on sl.link_type_id = lt.id 
where s1.id in (
	select s.id
	from term t 
	join synset s on t.synset_id = s.id 
	where t.word in ("Person", "Mensch", "Beruf")
)
and lt.link_name = "Oberbegriff"
order by t.word
limit 10000;



-- now we need to do this recursively, to also find the synsets that are indirect subordinates of "person" etc

-- 1 level of recursion

select t1.word, t2.word from 
synset s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
join synset_link sl2 on s2.id = sl2.target_synset_id 
join synset s3 on s3.id = sl2.synset_id 
join term t2 on t2.synset_id = s3.id 
join link_type lt2 on sl2.link_type_id = lt2.id 
where s1.id in (
	select s.id
	from term t 
	join synset s on t.synset_id = s.id 
	where t.word in ("Person", "Mensch", "Beruf")
)
and lt1.link_name = "Oberbegriff"
and lt2.link_name = "Oberbegriff"
order by t1.word, t2.word
limit 10000;


-- 3 levels of recursion

select t1.word, t2.word, t3.word from 
synset s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
join synset_link sl2 on s2.id = sl2.target_synset_id 
join synset s3 on s3.id = sl2.synset_id 
join term t2 on t2.synset_id = s3.id 
join link_type lt2 on sl2.link_type_id = lt2.id 
join synset_link sl3 on s3.id = sl3.target_synset_id 
join synset s4 on s4.id = sl3.synset_id 
join term t3 on t3.synset_id = s4.id 
join link_type lt3 on sl3.link_type_id = lt3.id
where s1.id in (
	select s.id
	from term t 
	join synset s on t.synset_id = s.id 
	where t.word in ("Person", "Mensch", "Beruf")
)
and lt1.link_name = "Oberbegriff"
and lt2.link_name = "Oberbegriff"
and lt3.link_name = "Oberbegriff"
order by t1.word, t2.word, t3.word
limit 10000;


-- 4 levels of recursion (times out)

select t1.word, t2.word, t3.word, t4.word from 
synset s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
join synset_link sl2 on s2.id = sl2.target_synset_id 
join synset s3 on s3.id = sl2.synset_id 
join term t2 on t2.synset_id = s3.id 
join link_type lt2 on sl2.link_type_id = lt2.id 
join synset_link sl3 on s3.id = sl3.target_synset_id 
join synset s4 on s4.id = sl3.synset_id 
join term t3 on t3.synset_id = s4.id 
join link_type lt3 on sl3.link_type_id = lt3.id
join synset_link sl4 on s4.id = sl4.target_synset_id 
join synset s5 on s5.id = sl4.synset_id 
join term t4 on t2.synset_id = s3.id 
join link_type lt4 on sl4.link_type_id = lt4.id
where s1.id in (
	select s.id
	from term t 
	join synset s on t.synset_id = s.id 
	where t.word in ("Person", "Mensch", "Beruf")
)
and lt1.link_name = "Oberbegriff"
and lt2.link_name = "Oberbegriff"
and lt3.link_name = "Oberbegriff"
and lt4.link_name = "Oberbegriff"
order by t1.word, t2.word, t3.word, t4.word
limit 10000;



-- we try a different, more efficient method to avoid the timeout

-- 1 level of recursion but more efficient
-- but does not include the results of the previous level

select t1.word from (
	select distinct s2.id from 
	synset s1
	join synset_link sl1 on s1.id = sl1.target_synset_id 
	join synset s2 on s2.id = sl1.synset_id 
	join link_type lt1 on sl1.link_type_id = lt1.id 
	where s1.id in (
		select s.id
		from term t 
		join synset s on t.synset_id = s.id 
		where t.word in ("Person", "Mensch", "Beruf")
	)
	and lt1.link_name = "Oberbegriff"
) as s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
where lt1.link_name = "Oberbegriff"
order by t1.word
limit 10000;


-- 2 levels of recursion
-- but does not include the results of the previous levels

select t1.word from (
	select distinct s2.id from (
		select distinct s2.id from 
		synset s1
		join synset_link sl1 on s1.id = sl1.target_synset_id 
		join synset s2 on s2.id = sl1.synset_id 
		join link_type lt1 on sl1.link_type_id = lt1.id 
		where s1.id in (
			select s.id
			from term t 
			join synset s on t.synset_id = s.id 
			where t.word in ("Person", "Mensch", "Beruf")
		)
		and lt1.link_name = "Oberbegriff"
	) as s1
	join synset_link sl1 on s1.id = sl1.target_synset_id 
	join synset s2 on s2.id = sl1.synset_id 
	join link_type lt1 on sl1.link_type_id = lt1.id 
	where lt1.link_name = "Oberbegriff"
) as s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
where lt1.link_name = "Oberbegriff"
order by t1.word
limit 10000;


-- 3 iterations
-- but does not include the results of the previous levels

select t1.word from (
	select distinct s2.id from (
		select distinct s2.id from (
			select distinct s2.id from 
			synset s1
			join synset_link sl1 on s1.id = sl1.target_synset_id 
			join synset s2 on s2.id = sl1.synset_id 
			join link_type lt1 on sl1.link_type_id = lt1.id 
			where s1.id in (
				select s.id
				from term t 
				join synset s on t.synset_id = s.id 
				where t.word in ("Person", "Mensch", "Beruf")
			)
			and lt1.link_name = "Oberbegriff"
		) as s1
		join synset_link sl1 on s1.id = sl1.target_synset_id 
		join synset s2 on s2.id = sl1.synset_id 
		join link_type lt1 on sl1.link_type_id = lt1.id 
		where lt1.link_name = "Oberbegriff"
	) as s1
	join synset_link sl1 on s1.id = sl1.target_synset_id 
	join synset s2 on s2.id = sl1.synset_id 
	join link_type lt1 on sl1.link_type_id = lt1.id 
	where lt1.link_name = "Oberbegriff"
) as s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
where lt1.link_name = "Oberbegriff"
order by t1.word
limit 10000;


-- 4 iterations
-- but does not include the results of the previous levels

select t1.word from (
	select distinct s2.id from (
		select distinct s2.id from (
			select distinct s2.id from (
				select distinct s2.id from 
				synset s1
				join synset_link sl1 on s1.id = sl1.target_synset_id 
				join synset s2 on s2.id = sl1.synset_id 
				join link_type lt1 on sl1.link_type_id = lt1.id 
				where s1.id in (
					select s.id
					from term t 
					join synset s on t.synset_id = s.id 
					where t.word in ("Person", "Mensch", "Beruf")
				)
				and lt1.link_name = "Oberbegriff"
			) as s1
			join synset_link sl1 on s1.id = sl1.target_synset_id 
			join synset s2 on s2.id = sl1.synset_id 
			join link_type lt1 on sl1.link_type_id = lt1.id 
			where lt1.link_name = "Oberbegriff"
		) as s1
		join synset_link sl1 on s1.id = sl1.target_synset_id 
		join synset s2 on s2.id = sl1.synset_id 
		join link_type lt1 on sl1.link_type_id = lt1.id 
		where lt1.link_name = "Oberbegriff"
	) as s1
	join synset_link sl1 on s1.id = sl1.target_synset_id 
	join synset s2 on s2.id = sl1.synset_id 
	join link_type lt1 on sl1.link_type_id = lt1.id 
	where lt1.link_name = "Oberbegriff"
) as s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
where lt1.link_name = "Oberbegriff"
order by t1.word
limit 10000;


-- 5 iterations
-- but does not include the results of the previous levels

select t1.word from (
	select distinct s2.id from (
		select distinct s2.id from (
			select distinct s2.id from (
				select distinct s2.id from (
					select distinct s2.id from 
					synset s1
					join synset_link sl1 on s1.id = sl1.target_synset_id 
					join synset s2 on s2.id = sl1.synset_id 
					join link_type lt1 on sl1.link_type_id = lt1.id 
					where s1.id in (
						select s.id
						from term t 
						join synset s on t.synset_id = s.id 
						where t.word in ("Person", "Mensch", "Beruf")
					)
					and lt1.link_name = "Oberbegriff"
				) as s1
				join synset_link sl1 on s1.id = sl1.target_synset_id 
				join synset s2 on s2.id = sl1.synset_id 
				join link_type lt1 on sl1.link_type_id = lt1.id 
				where lt1.link_name = "Oberbegriff"
			) as s1
			join synset_link sl1 on s1.id = sl1.target_synset_id 
			join synset s2 on s2.id = sl1.synset_id 
			join link_type lt1 on sl1.link_type_id = lt1.id 
			where lt1.link_name = "Oberbegriff"
		) as s1
		join synset_link sl1 on s1.id = sl1.target_synset_id 
		join synset s2 on s2.id = sl1.synset_id 
		join link_type lt1 on sl1.link_type_id = lt1.id 
		where lt1.link_name = "Oberbegriff"
	) as s1
	join synset_link sl1 on s1.id = sl1.target_synset_id 
	join synset s2 on s2.id = sl1.synset_id 
	join link_type lt1 on sl1.link_type_id = lt1.id 
	where lt1.link_name = "Oberbegriff"
) as s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
where lt1.link_name = "Oberbegriff"
order by t1.word
limit 10000;


-- 6 iterations
-- but does not include the results of the previous levels

select t1.word from (
	select distinct s2.id from (
		select distinct s2.id from (
			select distinct s2.id from (
				select distinct s2.id from (
					select distinct s2.id from (
						select distinct s2.id from 
						synset s1
						join synset_link sl1 on s1.id = sl1.target_synset_id 
						join synset s2 on s2.id = sl1.synset_id 
						join link_type lt1 on sl1.link_type_id = lt1.id 
						where s1.id in (
							select s.id
							from term t 
							join synset s on t.synset_id = s.id 
							where t.word in ("Person", "Mensch", "Beruf")
						)
						and lt1.link_name = "Oberbegriff"
					) as s1
					join synset_link sl1 on s1.id = sl1.target_synset_id 
					join synset s2 on s2.id = sl1.synset_id 
					join link_type lt1 on sl1.link_type_id = lt1.id 
					where lt1.link_name = "Oberbegriff"
				) as s1
				join synset_link sl1 on s1.id = sl1.target_synset_id 
				join synset s2 on s2.id = sl1.synset_id 
				join link_type lt1 on sl1.link_type_id = lt1.id 
				where lt1.link_name = "Oberbegriff"
			) as s1
			join synset_link sl1 on s1.id = sl1.target_synset_id 
			join synset s2 on s2.id = sl1.synset_id 
			join link_type lt1 on sl1.link_type_id = lt1.id 
			where lt1.link_name = "Oberbegriff"
		) as s1
		join synset_link sl1 on s1.id = sl1.target_synset_id 
		join synset s2 on s2.id = sl1.synset_id 
		join link_type lt1 on sl1.link_type_id = lt1.id 
		where lt1.link_name = "Oberbegriff"
	) as s1
	join synset_link sl1 on s1.id = sl1.target_synset_id 
	join synset s2 on s2.id = sl1.synset_id 
	join link_type lt1 on sl1.link_type_id = lt1.id 
	where lt1.link_name = "Oberbegriff"
) as s1
join synset_link sl1 on s1.id = sl1.target_synset_id 
join synset s2 on s2.id = sl1.synset_id 
join term t1 on t1.synset_id = s2.id 
join link_type lt1 on sl1.link_type_id = lt1.id 
where lt1.link_name = "Oberbegriff"
order by t1.word
limit 10000;

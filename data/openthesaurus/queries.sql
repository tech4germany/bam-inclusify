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
order by t.word;



-- now we need to do this recursively, to also find the synsets that are indirect subordinates of "person" etc

-- 1 level of recursion
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
order by t1.word;


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
order by t1.word;


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
order by t1.word;


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
order by t1.word;


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
order by t1.word;


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
order by t1.word;

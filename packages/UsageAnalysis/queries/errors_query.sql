--name: Errors1
--input: string date { pattern: datetime }
--input: list users
--connection: System:DatagrokAdmin
select e.event_time::date, count(1) from event_types et
join events e on e.event_type_id = et.id
join users_sessions s on e.session_id = s.id
join users u on u.id = s.user_id
where @date(e.event_time)
and (u.login = any(@users) or @users = ARRAY['all'])
and et.source = 'error'
and et.is_error = true
group by e.event_time::date;
--end

--name: TopErrors
--input: string date { pattern: datetime }
--input: list users
--connection: System:DatagrokAdmin
select et.friendly_name, et.id, count(1) from event_types et
join events e on e.event_type_id = et.id
join users_sessions s on e.session_id = s.id
join users u on u.id = s.user_id
where @date(e.event_time)
and (u.login = any(@users) or @users = ARRAY['all'])
and et.source = 'error'
and et.friendly_name is not null
and et.friendly_name != ''
group by et.friendly_name, et.id
limit 50;
--end

--name: TopErrorSources
--input: string date { pattern: datetime }
--input: list users
--connection: System:DatagrokAdmin
select et.error_source, count(1) from event_types et
join events e on e.event_type_id = et.id
join users_sessions s on e.session_id = s.id
join users u on u.id = s.user_id
where @date(e.event_time)
and (u.login = any(@users) or @users = ARRAY['all'])
and et.source = 'error'
and et.is_error = true
group by et.error_source
limit 50;
--end
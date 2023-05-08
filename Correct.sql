DROP DATABASE IF EXISTS bootcamp;

CREATE DATABASE bootcamp;

-- check whether role is exist, if not it will create the role user
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT                       -- SELECT list can stay empty for this
      FROM   pg_catalog.pg_roles
      WHERE  rolname = 'postgres') THEN
      CREATE ROLE postgres;
      
   END IF;
END
$do$;

ALTER DATABASE bootcamp OWNER TO postgres;

ALTER USER postgres WITH PASSWORD 'bootcamp';

ALTER ROLE "postgres" WITH LOGIN; 


\c bootcamp;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE users (
  id uuid PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  profileImage VARCHAR(255)
);

CREATE TABLE tokens (
  id uuid REFERENCES users (id),
  token CHAR(64),
  expiryTimeStamp TIMESTAMP,
  type VARCHAR(255),
  PRIMARY KEY (id, token)
);



CREATE TABLE notes (
  note_id uuid PRIMARY KEY,
  note_name VARCHAR(255) NOT NULL,
  note_type VARCHAR(255) NOT NULL,
  note_is_protected BOOLEAN NOT NULL,
  note_password VARCHAR(255),
  note_link VARCHAR(255) NOT NULL,
  note_data TEXT, 
  note_created_by uuid NOT NULL REFERENCES users(id),
  vote integer DEFAULT 0,
  is_available_for_public BOOLEAN NOT NULL DEFAULT FALSE
);
-- ALTER TABLE notes ADD COLUMN vote integer DEFAULT 0;
-- ALTER TABLE notes ADD COLUMN is_available_for_public BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE note_shared_to (
  shared_id SERIAL PRIMARY KEY,
  note_id uuid NOT NULL REFERENCES notes(note_id),
  user_id uuid NOT NULL REFERENCES users(id),
  access_right VARCHAR(20) NOT NULL
);


CREATE TABLE extra_file (
  file_id uuid PRIMARY KEY,
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  type TEXT NOT NULL,
  file_created_by uuid NOT NULL,
  note_id uuid REFERENCES notes(note_id) ON DELETE CASCADE
);

CREATE TABLE extra_file_shared_to (
  file_id uuid REFERENCES extra_file(file_id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  access_right TEXT NOT NULL,
  PRIMARY KEY (file_id, user_id)
);



-- insert user
CREATE OR REPLACE FUNCTION insert_user(
    p_name VARCHAR(255),
    p_email VARCHAR(255),
    p_password VARCHAR(255),
    p_profileImage VARCHAR(255)
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    INSERT INTO users(id, name, email, password, profileImage)
    VALUES (uuid_generate_v4(), p_name, p_email, p_password, p_profileImage)
    RETURNING id INTO user_id;
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;



-- insert token
CREATE OR REPLACE PROCEDURE insert_token(
    IN user_id UUID,
    IN token CHAR(64),
    IN expiry_timestamp TIMESTAMP,
    IN token_type VARCHAR(255)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if token already exists for user
    IF EXISTS (SELECT 1 FROM tokens WHERE id = user_id) THEN
        -- Update existing token
        UPDATE tokens
        SET token = insert_token.token,
            expiryTimeStamp = insert_token.expiry_timestamp,
            type = insert_token.token_type
        WHERE id = insert_token.user_id;
    ELSE
        -- Insert new token
        INSERT INTO tokens (id, token, expiryTimeStamp, type)
        VALUES (insert_token.user_id, insert_token.token, insert_token.expiry_timestamp, insert_token.token_type);
    END IF;
END;
$$;



-- to check if token is expired or not
CREATE OR REPLACE FUNCTION is_token_expired(p_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  expiryTime TIMESTAMP;
BEGIN
  SELECT expiryTimeStamp INTO expiryTime FROM tokens WHERE id = p_id;
  RETURN expiryTime < NOW();
END;
$$ LANGUAGE plpgsql;



-- update_user
CREATE OR REPLACE PROCEDURE update_user(
    IN user_id UUID,
    IN new_name VARCHAR(255) DEFAULT '',
    IN new_email VARCHAR(255) DEFAULT '',
    IN new_password VARCHAR(255) DEFAULT '',
    IN new_profileImage VARCHAR(255) DEFAULT ''
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE users SET
        name = CASE WHEN new_name <> '' THEN new_name ELSE name END,
        email = CASE WHEN new_email <> '' THEN new_email ELSE email END,
        password = CASE WHEN new_password <> '' THEN new_password ELSE password END,
        profileImage = CASE WHEN new_profileImage <> '' THEN new_profileImage ELSE profileImage END
    WHERE id = user_id;
END;
$$;

-- check_user_token
CREATE OR REPLACE FUNCTION check_user_token(
  p_user_id uuid,
  p_token CHAR(64)
) RETURNS BOOLEAN AS $$
DECLARE
  token_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM tokens WHERE id = p_user_id AND token = p_token
  ) INTO token_exists;
  
  RETURN token_exists;
END;
$$ LANGUAGE plpgsql;


-- create_note
CREATE OR REPLACE FUNCTION create_note(
  _note_id uuid,
  _note_name VARCHAR(255),
  _note_type VARCHAR(255),
  _note_is_protected BOOLEAN,
  _note_password VARCHAR(255),
  _note_link VARCHAR(255),
  _note_data TEXT,
  _note_created_by uuid,
  _is_available_for_public BOOLEAN
) RETURNS uuid AS $$
DECLARE
BEGIN
  INSERT INTO notes (note_id, note_name, note_type, note_is_protected, note_password, note_link, note_data, note_created_by, is_available_for_public)
  VALUES (_note_id, _note_name, _note_type, _note_is_protected, _note_password, _note_link, _note_data, _note_created_by, _is_available_for_public)
  RETURNING note_id INTO _note_id;

  -- Add owner access right in note_shared_to table
  INSERT INTO note_shared_to (note_id, user_id, access_right)
  VALUES (_note_id, _note_created_by, 'owner');
  
  RETURN _note_id;
END;
$$ LANGUAGE plpgsql;



--add_note_shared_to
CREATE OR REPLACE FUNCTION add_note_shared_to(
  _note_id uuid,
  _user_id uuid,
  _access_right VARCHAR(20)
) RETURNS void AS $$
DECLARE
  _note_exists BOOLEAN;
  _user_exists BOOLEAN;
  _existing_access_right VARCHAR(20);
BEGIN
  -- Check if note exists
  SELECT EXISTS(SELECT 1 FROM notes WHERE note_id = _note_id) INTO _note_exists;
  IF NOT _note_exists THEN
    RAISE EXCEPTION 'Note with ID % does not exist', _note_id;
  END IF;

  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE id = _user_id) INTO _user_exists;
  IF NOT _user_exists THEN
    RAISE EXCEPTION 'User with ID % does not exist', _user_id;
  END IF;

  -- Check if note is already shared with user
  SELECT access_right INTO _existing_access_right FROM note_shared_to WHERE note_id = _note_id AND user_id = _user_id;
  IF FOUND THEN
    -- If note is already shared, update the access_right
    UPDATE note_shared_to SET access_right = _access_right WHERE note_id = _note_id AND user_id = _user_id;
  ELSE
    -- If note is not shared, insert a new entry
    INSERT INTO note_shared_to (note_id, user_id, access_right) VALUES (_note_id, _user_id, _access_right);
  END IF;
END;
$$ LANGUAGE plpgsql;



-- update_note
CREATE OR REPLACE FUNCTION update_note(
  _note_id uuid,
  _note_name VARCHAR(255),
  _note_type VARCHAR(255),
  _note_is_protected BOOLEAN,
  _note_password VARCHAR(255),
  _note_link VARCHAR(255),
  _note_data TEXT,
  _is_available_for_public BOOLEAN,
  _user_id uuid
) RETURNS VOID AS $$
DECLARE
  _access_right VARCHAR(20);
BEGIN
  SELECT access_right INTO _access_right FROM note_shared_to WHERE note_id = _note_id AND user_id = _user_id;

  IF _access_right IS NULL OR (_access_right != 'owner' AND _access_right != 'write') THEN
    RAISE EXCEPTION 'You do not have permission to update this note';
  END IF;
  
  IF _note_password = '' THEN
    _note_password := null;
  END IF;
  
  IF _note_name = '' THEN
    _note_name := null;
  END IF;

  IF _note_type = '' THEN
    _note_type := null;
  END IF;

  IF _note_link = '' THEN
    _note_link := null;
  END IF;

  IF _note_data = '' THEN
    _note_data := null;
  END IF;

  UPDATE notes SET 
    note_name = COALESCE(_note_name, note_name),
    note_type = COALESCE(_note_type, note_type),
    note_is_protected = COALESCE(_note_is_protected, note_is_protected),
    note_password = COALESCE(_note_password, note_password),
    note_link = COALESCE(_note_link, note_link),
    note_data = COALESCE(_note_data, note_data),
    is_available_for_public = COALESCE(_is_available_for_public, is_available_for_public)
  WHERE note_id = _note_id;
END;
$$ LANGUAGE plpgsql;

-- check_note_shared_to
CREATE OR REPLACE FUNCTION check_note_shared_to(
    IN input_user_id uuid,
    IN input_note_id uuid
)
RETURNS BOOLEAN
AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM note_shared_to
        WHERE user_id = input_user_id AND note_id = input_note_id
    );
END;
$$ LANGUAGE plpgsql;

-- check_note_is_public
CREATE OR REPLACE FUNCTION note_is_public(
    IN input_note_id uuid
)
RETURNS BOOLEAN
AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM notes
        WHERE note_id = input_note_id AND is_available_for_public = true
    );
END;
$$ LANGUAGE plpgsql;






-- get_note
CREATE OR REPLACE FUNCTION get_note(
    IN input_note_id uuid,
    IN input_user_id uuid
)
RETURNS TABLE (
    note_id uuid,
    note_name VARCHAR(255),
    note_type VARCHAR(255),
    note_is_protected BOOLEAN,
    note_link VARCHAR(255),
    note_data TEXT,
    note_created_by uuid,
    vote integer,
    is_available_for_public BOOLEAN,
    shared_id INTEGER,
    user_id uuid,
    access_right VARCHAR(20)
)
AS $$
BEGIN
    RETURN QUERY
    SELECT n.note_id,
           n.note_name,
           n.note_type,
           n.note_is_protected,
           n.note_link,
           n.note_data,
           n.note_created_by,
           n.vote,
           n.is_available_for_public,
           s.shared_id,
           s.user_id,
           s.access_right
    FROM notes n
    LEFT JOIN note_shared_to s ON n.note_id = s.note_id
    WHERE n.note_id = input_note_id
      AND (n.note_created_by = input_user_id OR
           s.user_id = input_user_id AND
           s.access_right IN ('owner', 'write', 'read'))
      AND (n.is_available_for_public = true OR
           s.access_right = 'public');
END;
$$ LANGUAGE plpgsql;


-- add_file_to_note 
CREATE OR REPLACE PROCEDURE add_file_to_note (
    IN p_file_id uuid,
    IN p_name TEXT,
    IN p_link TEXT,
    IN p_type TEXT,
    IN p_file_created_by uuid,
    IN p_note_id uuid,
    IN p_user_id uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO extra_file (file_id, name, link, type, file_created_by, note_id)
    VALUES (p_file_id, p_name, p_link, p_type, p_file_created_by, p_note_id);

    INSERT INTO extra_file_shared_to (file_id, user_id, access_right)
    VALUES (p_file_id, p_user_id, 'owner');
END;
$$;

-- add_file_share
-- add_file_share
CREATE OR REPLACE PROCEDURE add_file_share (
    IN p_file_id uuid,
    IN p_user_id uuid,
    IN p_access_right TEXT,
    IN p_owner_id uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM extra_file_shared_to
        WHERE file_id = p_file_id AND user_id = p_owner_id AND access_right = 'owner'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM extra_file_shared_to
            WHERE file_id = p_file_id AND user_id = p_user_id
        ) THEN
            UPDATE extra_file_shared_to
            SET access_right = p_access_right
            WHERE file_id = p_file_id AND user_id = p_user_id;
        ELSE
            INSERT INTO extra_file_shared_to (file_id, user_id, access_right)
            VALUES (p_file_id, p_user_id, p_access_right);
        END IF;
    ELSE
        RAISE EXCEPTION 'User does not have "owner" access to the file';
    END IF;
END;
$$;



-- update_file_share_access_right
CREATE OR REPLACE PROCEDURE update_file_share_access_right (
    IN p_file_id uuid,
    IN p_user_id uuid,
    IN p_access_right TEXT,
    IN p_owner_id uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM extra_file_shared_to
        WHERE file_id = p_file_id AND user_id = p_owner_id AND access_right = 'owner'
    ) THEN
        UPDATE extra_file_shared_to
        SET access_right = p_access_right
        WHERE file_id = p_file_id AND user_id = p_user_id;
    ELSE
        RAISE EXCEPTION 'User does not have "owner" access to the file';
    END IF;
END;
$$;

--check_file_access
CREATE OR REPLACE FUNCTION check_file_access(
    IN input_user_id uuid,
    IN input_file_id uuid
)
RETURNS BOOLEAN
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM extra_file_shared_to
        WHERE file_id = input_file_id
          AND user_id = input_user_id
    );
END;
$$ LANGUAGE plpgsql;


-- get_extra_file_details_by_file_id
CREATE OR REPLACE FUNCTION get_extra_file_details(p_file_id uuid)
RETURNS TABLE (
    file_id uuid,
    name TEXT,
    link TEXT,
    type TEXT,
    file_created_by uuid,
    note_id uuid
) AS $$
BEGIN
    RETURN QUERY SELECT *
                 FROM extra_file e
                 WHERE e.file_id = p_file_id;
END;
$$ LANGUAGE plpgsql;


--check_file_access
CREATE OR REPLACE FUNCTION check_user_exist(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255)
)
RETURNS BOOLEAN
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM users
        WHERE email = p_email
          AND password = p_password
    );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_user_details(input_user_id uuid)
RETURNS TABLE (
    user_id uuid,
    user_name varchar(255),
    user_email varchar(255),
    user_profile_image  VARCHAR(255)
)
AS $$
BEGIN
    RETURN QUERY SELECT id, name, email, profileImage FROM users WHERE id = input_user_id;
END;
$$ LANGUAGE plpgsql;

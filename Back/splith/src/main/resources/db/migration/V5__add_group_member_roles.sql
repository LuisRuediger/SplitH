CREATE TABLE group_members (
    user_id   BIGINT NOT NULL,
    group_id  BIGINT NOT NULL,
    role      VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id),
    CONSTRAINT fk_gm_user  FOREIGN KEY (user_id)  REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES split_groups(id) ON DELETE CASCADE
);

INSERT INTO group_members (user_id, group_id, role)
SELECT user_id, group_id, 'ADMIN' FROM user_group;

DROP TABLE user_group;

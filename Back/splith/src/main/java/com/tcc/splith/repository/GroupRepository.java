package com.tcc.splith.repository;

import com.tcc.splith.entity.Group;
import com.tcc.splith.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    @Query("SELECT gm.group FROM GroupMember gm WHERE gm.user = :user")
    List<Group> findGroupsByMember(@Param("user") User user);

    Optional<Group> findByName(String name);
}

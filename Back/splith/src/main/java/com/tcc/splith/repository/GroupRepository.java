package com.tcc.splith.repository;

import com.tcc.splith.entity.Group;
import com.tcc.splith.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByMembersContaining(User user);
    Optional<Group> findByName(String name);
}
package com.tcc.splith.repository;

import com.tcc.splith.entity.Group;
import com.tcc.splith.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    // Essa função busca todos os grupos em que um usuário específico está dentro
    List<Group> findByMembersContaining(User user);
}
